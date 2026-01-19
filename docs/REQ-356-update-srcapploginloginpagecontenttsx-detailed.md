# REQ-356: Update LoginPageContent.tsx - Detailed Task Breakdown

**Created:** 2026-01-19 13:15 UTC
**Last Modified:** 2026-01-19 13:15 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.2
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High

---

## Overview

This document provides a granular, step-by-step implementation guide for internationalizing the `LoginPageContent.tsx` component. Each task is designed to be approximately 1 story point and can be executed independently where dependencies allow.

**Target File:** `/src/app/login/LoginPageContent.tsx`
**Component Type:** Client Component (`'use client'` directive)
**Translation Hook:** `useTranslations` from `next-intl`

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [x] Epic 1 Foundation complete (next-intl installed, IntlProvider configured)
- [x] `/messages/en.json` exists with `auth` namespace stub
- [x] `useTranslations` hook available from `next-intl`
- [ ] Task 2A.1 (Create `auth` namespace structure) is complete or in-progress

---

## String Inventory

### Complete Extraction Map

| ID | Line | Current String | Translation Key | Category |
|----|------|----------------|-----------------|----------|
| S1 | 165 | `'Completing authentication...'` | `auth.login.loading.authenticating` | Loading |
| S2 | 165 | `'Loading authentication...'` | `auth.login.loading.default` | Loading |
| S3 | 134 | `'Completing Google sign-in...'` | `auth.login.messages.completingGoogle` | OAuth |
| S4 | 178 | `'Login successful! Redirecting...'` | `auth.login.messages.success` | Success |
| S5 | 236 | `'FAQBNB Logo'` | `auth.login.logoAlt` | Accessibility |
| S6 | 243 | `'Admin Access'` | `auth.login.adminAccess` | Header |
| S7 | 248 | `'Sign in to your account'` | `auth.login.title` | Header |
| S8 | 251 | `'Access the FAQBNB administration panel'` | `auth.login.subtitle` | Header |
| S9 | 275 | `'Back to Home'` | `auth.login.backToHome` | Navigation |
| S10 | 289 | `'Clear Session'` | `auth.login.clearSession` | Action |
| S11 | 296 | `'© 2024 FAQBNB. All rights reserved.'` | `auth.login.copyright` | Footer |
| S12 | 331-332 | `'Secure Access'` | `auth.login.secureAccess` | Security |
| S13 | 334-336 | `'This area is restricted to authorized administrators only. All access attempts are logged and monitored.'` | `auth.login.secureAccessDescription` | Security |
| S14 | 167-169 | Debug text | N/A - Remove or conditionalize | Debug |

**Note:** `'FAQBNB'` (brand name on line 242) is intentionally kept as-is (not translated).

---

## Detailed Implementation Tasks

### Task 1: Expand auth.login Namespace in Translation Files

**Estimate:** 1 story point
**Dependencies:** None
**Files to Modify:**
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

#### 1.1 Update English Translation File

Add the following to `/messages/en.json` under the `auth` namespace:

```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "confirmLogout": "Confirm Logout",
    "confirmSignOutMessage": "Are you sure you want to sign out?",
    "signUp": "Sign Up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "resetPassword": "Reset Password",
    "continueWithGoogle": "Continue with Google",
    "rememberMe": "Remember me",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "createAccount": "Create Account",
    "verifyEmail": "Verify Email",
    "resendVerification": "Resend Verification",
    "welcomeBack": "Welcome back",
    "loggedInAs": "Logged in as",
    "login": {
      "title": "Sign in to your account",
      "subtitle": "Access the FAQBNB administration panel",
      "adminAccess": "Admin Access",
      "backToHome": "Back to Home",
      "clearSession": "Clear Session",
      "secureAccess": "Secure Access",
      "secureAccessDescription": "This area is restricted to authorized administrators only. All access attempts are logged and monitored.",
      "copyright": "© {year} FAQBNB. All rights reserved.",
      "logoAlt": "FAQBNB Logo",
      "loading": {
        "authenticating": "Completing authentication...",
        "default": "Loading authentication..."
      },
      "messages": {
        "success": "Login successful! Redirecting...",
        "completingGoogle": "Completing Google sign-in..."
      }
    }
  }
}
```

#### 1.2 Update French Translation File (`/messages/fr.json`)

```json
{
  "auth": {
    "login": {
      "title": "Connectez-vous à votre compte",
      "subtitle": "Accédez au panneau d'administration FAQBNB",
      "adminAccess": "Accès Admin",
      "backToHome": "Retour à l'accueil",
      "clearSession": "Effacer la session",
      "secureAccess": "Accès sécurisé",
      "secureAccessDescription": "Cette zone est réservée aux administrateurs autorisés uniquement. Toutes les tentatives d'accès sont enregistrées et surveillées.",
      "copyright": "© {year} FAQBNB. Tous droits réservés.",
      "logoAlt": "Logo FAQBNB",
      "loading": {
        "authenticating": "Authentification en cours...",
        "default": "Chargement de l'authentification..."
      },
      "messages": {
        "success": "Connexion réussie ! Redirection...",
        "completingGoogle": "Connexion Google en cours..."
      }
    }
  }
}
```

#### 1.3 Update Spanish Translation File (`/messages/es.json`)

```json
{
  "auth": {
    "login": {
      "title": "Inicia sesión en tu cuenta",
      "subtitle": "Accede al panel de administración de FAQBNB",
      "adminAccess": "Acceso Admin",
      "backToHome": "Volver al inicio",
      "clearSession": "Limpiar sesión",
      "secureAccess": "Acceso seguro",
      "secureAccessDescription": "Esta área está restringida solo a administradores autorizados. Todos los intentos de acceso son registrados y monitoreados.",
      "copyright": "© {year} FAQBNB. Todos los derechos reservados.",
      "logoAlt": "Logo de FAQBNB",
      "loading": {
        "authenticating": "Completando autenticación...",
        "default": "Cargando autenticación..."
      },
      "messages": {
        "success": "¡Inicio de sesión exitoso! Redirigiendo...",
        "completingGoogle": "Completando inicio de sesión con Google..."
      }
    }
  }
}
```

#### 1.4 Update German Translation File (`/messages/de.json`)

```json
{
  "auth": {
    "login": {
      "title": "Melden Sie sich bei Ihrem Konto an",
      "subtitle": "Zugang zum FAQBNB-Administrationspanel",
      "adminAccess": "Admin-Zugang",
      "backToHome": "Zurück zur Startseite",
      "clearSession": "Sitzung löschen",
      "secureAccess": "Sicherer Zugang",
      "secureAccessDescription": "Dieser Bereich ist nur für autorisierte Administratoren zugänglich. Alle Zugriffsversuche werden protokolliert und überwacht.",
      "copyright": "© {year} FAQBNB. Alle Rechte vorbehalten.",
      "logoAlt": "FAQBNB-Logo",
      "loading": {
        "authenticating": "Authentifizierung wird abgeschlossen...",
        "default": "Authentifizierung wird geladen..."
      },
      "messages": {
        "success": "Anmeldung erfolgreich! Weiterleitung...",
        "completingGoogle": "Google-Anmeldung wird abgeschlossen..."
      }
    }
  }
}
```

#### 1.5 Update Dutch Translation File (`/messages/nl.json`)

```json
{
  "auth": {
    "login": {
      "title": "Log in op uw account",
      "subtitle": "Toegang tot het FAQBNB-beheerpaneel",
      "adminAccess": "Admin Toegang",
      "backToHome": "Terug naar home",
      "clearSession": "Sessie wissen",
      "secureAccess": "Beveiligde toegang",
      "secureAccessDescription": "Dit gebied is alleen toegankelijk voor geautoriseerde beheerders. Alle toegangspogingen worden geregistreerd en gemonitord.",
      "copyright": "© {year} FAQBNB. Alle rechten voorbehouden.",
      "logoAlt": "FAQBNB Logo",
      "loading": {
        "authenticating": "Authenticatie voltooien...",
        "default": "Authenticatie laden..."
      },
      "messages": {
        "success": "Inloggen gelukt! Doorverwijzen...",
        "completingGoogle": "Google-aanmelding voltooien..."
      }
    }
  }
}
```

#### 1.6 Update Italian Translation File (`/messages/it.json`)

```json
{
  "auth": {
    "login": {
      "title": "Accedi al tuo account",
      "subtitle": "Accedi al pannello di amministrazione FAQBNB",
      "adminAccess": "Accesso Admin",
      "backToHome": "Torna alla home",
      "clearSession": "Cancella sessione",
      "secureAccess": "Accesso sicuro",
      "secureAccessDescription": "Quest'area è riservata solo agli amministratori autorizzati. Tutti i tentativi di accesso vengono registrati e monitorati.",
      "copyright": "© {year} FAQBNB. Tutti i diritti riservati.",
      "logoAlt": "Logo FAQBNB",
      "loading": {
        "authenticating": "Completamento autenticazione...",
        "default": "Caricamento autenticazione..."
      },
      "messages": {
        "success": "Accesso riuscito! Reindirizzamento...",
        "completingGoogle": "Completamento accesso Google..."
      }
    }
  }
}
```

**Verification:**
- [ ] All 6 language files have identical key structure under `auth.login`
- [ ] No typos in key names
- [ ] ICU format for `copyright` includes `{year}` placeholder

---

### Task 2: Add useTranslations Import

**Estimate:** Trivial (< 0.5 story point)
**Dependencies:** Task 1
**File to Modify:** `/src/app/login/LoginPageContent.tsx`

#### 2.1 Add Import Statement

**Location:** After line 10 (after existing imports)

**Add:**
```typescript
import { useTranslations } from 'next-intl';
```

**Resulting imports section (lines 1-11):**
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
import { useTranslations } from 'next-intl';
```

**Verification:**
- [ ] Import statement added without syntax errors
- [ ] No duplicate imports

---

### Task 3: Initialize Translation Hook

**Estimate:** Trivial (< 0.5 story point)
**Dependencies:** Task 2
**File to Modify:** `/src/app/login/LoginPageContent.tsx`

#### 3.1 Add Hook Initialization

**Location:** Inside `LoginPageContent` function, after line 20 (after `useAuth` hook)

**Add:**
```typescript
const t = useTranslations('auth.login');
```

**Context (lines 17-22 after change):**
```typescript
export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, authState } = useAuth();
  const t = useTranslations('auth.login');

  // REQ-025: Debug logging for sequential authentication state machine
```

**Verification:**
- [ ] Hook initialized at component level (not inside conditionals)
- [ ] Namespace matches translation file structure (`auth.login`)

---

### Task 4: Update Loading State Messages

**Estimate:** 1 story point
**Dependencies:** Tasks 1-3
**File to Modify:** `/src/app/login/LoginPageContent.tsx`

#### 4.1 Replace Loading Text (Lines 160-173)

**Current code (lines 164-166):**
```tsx
<p className="text-gray-600">
  {authState === 'LOADING' ? 'Completing authentication...' : 'Loading authentication...'}
</p>
```

**Replace with:**
```tsx
<p className="text-gray-600">
  {authState === 'LOADING' ? t('loading.authenticating') : t('loading.default')}
</p>
```

#### 4.2 Remove or Conditionalize Debug Text (Lines 167-169)

**Current code:**
```tsx
<p className="text-xs text-gray-400 mt-2">
  Debug: Check console for LOGIN_PAGE_DEBUG logs (REQ-025)
</p>
```

**Option A - Remove entirely:**
Delete lines 167-169.

**Option B - Conditionalize for development only (Recommended):**
```tsx
{process.env.NODE_ENV === 'development' && (
  <p className="text-xs text-gray-400 mt-2">
    Debug: Check console for LOGIN_PAGE_DEBUG logs (REQ-025)
  </p>
)}
```

**Verification:**
- [ ] Loading messages use `t()` function calls
- [ ] Debug text handled appropriately
- [ ] No hardcoded English strings in loading section

---

### Task 5: Update OAuth Message Handler

**Estimate:** Trivial (< 0.5 story point)
**Dependencies:** Tasks 1-3
**File to Modify:** `/src/app/login/LoginPageContent.tsx`

#### 5.1 Replace Google Sign-in Message (Lines 132-135)

**Current code:**
```typescript
setLoginMessage({
  type: 'info',
  message: 'Completing Google sign-in...',
});
```

**Replace with:**
```typescript
setLoginMessage({
  type: 'info',
  message: t('messages.completingGoogle'),
});
```

**Verification:**
- [ ] OAuth message uses translation key
- [ ] Message type (`info`) preserved

---

### Task 6: Update Success Handler

**Estimate:** Trivial (< 0.5 story point)
**Dependencies:** Tasks 1-3
**File to Modify:** `/src/app/login/LoginPageContent.tsx`

#### 6.1 Replace Success Message (Lines 175-180)

**Current code:**
```typescript
const handleLoginSuccess = () => {
  setLoginMessage({
    type: 'success',
    message: 'Login successful! Redirecting...',
  });
};
```

**Replace with:**
```typescript
const handleLoginSuccess = () => {
  setLoginMessage({
    type: 'success',
    message: t('messages.success'),
  });
};
```

**Verification:**
- [ ] Success message uses translation key
- [ ] Message type (`success`) preserved
- [ ] Function behavior unchanged

---

### Task 7: Update Header Section

**Estimate:** 1 story point
**Dependencies:** Tasks 1-3
**File to Modify:** `/src/app/login/LoginPageContent.tsx`

#### 7.1 Update Logo Alt Text (Line 236)

**Current:**
```tsx
alt="FAQBNB Logo"
```

**Replace with:**
```tsx
alt={t('logoAlt')}
```

#### 7.2 Update Admin Access Text (Line 243)

**Current:**
```tsx
<p className="text-sm text-gray-600">Admin Access</p>
```

**Replace with:**
```tsx
<p className="text-sm text-gray-600">{t('adminAccess')}</p>
```

#### 7.3 Update Page Title (Line 247-249)

**Current:**
```tsx
<h2 className="text-3xl font-bold text-gray-900">
  Sign in to your account
</h2>
```

**Replace with:**
```tsx
<h2 className="text-3xl font-bold text-gray-900">
  {t('title')}
</h2>
```

#### 7.4 Update Subtitle (Lines 250-252)

**Current:**
```tsx
<p className="mt-2 text-sm text-gray-600">
  Access the FAQBNB administration panel
</p>
```

**Replace with:**
```tsx
<p className="mt-2 text-sm text-gray-600">
  {t('subtitle')}
</p>
```

**Note:** Keep `FAQBNB` brand name on line 242 as-is (not translated).

**Verification:**
- [ ] Logo alt text translated (accessibility)
- [ ] All header text uses translation keys
- [ ] Brand name "FAQBNB" remains unchanged
- [ ] CSS classes preserved

---

### Task 8: Update Footer Section

**Estimate:** 1 story point
**Dependencies:** Tasks 1-3
**File to Modify:** `/src/app/login/LoginPageContent.tsx`

#### 8.1 Update "Back to Home" Link (Line 274-276)

**Current:**
```tsx
<Home className="w-4 h-4 mr-1" />
Back to Home
```

**Replace with:**
```tsx
<Home className="w-4 h-4 mr-1" />
{t('backToHome')}
```

#### 8.2 Update "Clear Session" Button (Line 289)

**Current:**
```tsx
Clear Session
```

**Replace with:**
```tsx
{t('clearSession')}
```

#### 8.3 Update Copyright Notice (Lines 295-297)

**Current:**
```tsx
<p className="text-xs text-gray-500">
  © 2024 FAQBNB. All rights reserved.
</p>
```

**Replace with:**
```tsx
<p className="text-xs text-gray-500">
  {t('copyright', { year: new Date().getFullYear() })}
</p>
```

**Verification:**
- [ ] Navigation link text translated
- [ ] Action button text translated
- [ ] Copyright year is dynamic via ICU interpolation
- [ ] All CSS classes preserved

---

### Task 9: Update Security Notice Section

**Estimate:** 1 story point
**Dependencies:** Tasks 1-3
**File to Modify:** `/src/app/login/LoginPageContent.tsx`

#### 9.1 Update Security Notice Title (Lines 331-333)

**Current:**
```tsx
<h3 className="text-sm font-medium text-gray-800">
  Secure Access
</h3>
```

**Replace with:**
```tsx
<h3 className="text-sm font-medium text-gray-800">
  {t('secureAccess')}
</h3>
```

#### 9.2 Update Security Notice Description (Lines 334-337)

**Current:**
```tsx
<p className="text-xs text-gray-600 mt-1">
  This area is restricted to authorized administrators only.
  All access attempts are logged and monitored.
</p>
```

**Replace with:**
```tsx
<p className="text-xs text-gray-600 mt-1">
  {t('secureAccessDescription')}
</p>
```

**Verification:**
- [ ] Security notice title translated
- [ ] Security notice description translated
- [ ] Layout and styling preserved
- [ ] No hardcoded text in security section

---

### Task 10: Final Verification and Testing

**Estimate:** 1 story point
**Dependencies:** Tasks 1-9
**Files to Verify:** All modified files

#### 10.1 Code Verification Checklist

- [ ] No TypeScript/ESLint errors
- [ ] All `t()` calls reference valid translation keys
- [ ] No hardcoded English strings remain (except brand name)
- [ ] Component renders without runtime errors

#### 10.2 Manual Testing Checklist

Test the login page in each supported language:

| Test Case | EN | FR | ES | DE | NL | IT |
|-----------|----|----|----|----|----|----|
| Page title displays correctly | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Page subtitle displays correctly | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Admin Access text displays | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Loading state (authenticating) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Loading state (default) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Success message appears | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Google OAuth message appears | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| "Back to Home" link text | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| "Clear Session" button text | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Copyright with dynamic year | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Security notice title | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Security notice description | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Logo alt text (inspect element) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

#### 10.3 Accessibility Verification

- [ ] Logo `alt` attribute contains translated text
- [ ] Screen reader announces translated content correctly
- [ ] Tab order and focus states work correctly

#### 10.4 Layout Verification

Check for text overflow issues, especially in German (typically 30% longer):

- [ ] Header section fits within container
- [ ] Footer links don't wrap unexpectedly
- [ ] Security notice doesn't overflow its container
- [ ] Copyright text fits on single line

---

## Complete Code Reference

### Final LoginPageContent.tsx Changes Summary

```typescript
// Line ~11: Add import
import { useTranslations } from 'next-intl';

// Line ~21: Add hook initialization (inside component)
const t = useTranslations('auth.login');

// Line ~134: OAuth message
message: t('messages.completingGoogle'),

// Line ~165: Loading state
{authState === 'LOADING' ? t('loading.authenticating') : t('loading.default')}

// Line ~178: Success message
message: t('messages.success'),

// Line ~236: Logo alt
alt={t('logoAlt')}

// Line ~243: Admin Access
<p className="text-sm text-gray-600">{t('adminAccess')}</p>

// Line ~248: Title
{t('title')}

// Line ~251: Subtitle
{t('subtitle')}

// Line ~275: Back to Home
{t('backToHome')}

// Line ~289: Clear Session
{t('clearSession')}

// Line ~296: Copyright
{t('copyright', { year: new Date().getFullYear() })}

// Line ~332: Security title
{t('secureAccess')}

// Line ~335: Security description
{t('secureAccessDescription')}
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation key at runtime | Low | Medium | Verify all keys exist in all language files before testing |
| Text overflow in German/Dutch | Medium | Low | Test with German translations, adjust layout if needed |
| OAuth flow regression | Low | High | Test complete Google sign-in flow after changes |
| Accessibility regression | Low | Medium | Verify screen reader announces all translated text |

---

## Dependencies

### Blocked By
- Task 2A.1: Create `auth` namespace structure (can be done in parallel)

### Blocks
- None (LoginPageContent is a leaf component)

### Related Tasks
- Task 2A.3: Update LoginForm.tsx
- Task 2A.5: Update GoogleOAuthButton.tsx

---

## Acceptance Criteria Verification

| Criterion | Task(s) | Status |
|-----------|---------|--------|
| All hardcoded text strings identified and catalogued | String Inventory | [ ] |
| Page title and subtitle use translation keys | Task 7 | [ ] |
| Loading state messages use translation keys | Task 4 | [ ] |
| Success confirmation messages extracted | Task 6 | [ ] |
| OAuth flow messages use translation keys | Task 5 | [ ] |
| Security notice internationalized | Task 9 | [ ] |
| Footer link text uses translation keys | Task 8 | [ ] |
| Copyright notice with dynamic year | Task 8 | [ ] |
| Component imports useTranslations | Task 2 | [ ] |
| All auth flows function correctly | Task 10 | [ ] |
| Existing styling maintained | All tasks | [ ] |
| Accessibility attributes maintained | Task 7, 10 | [ ] |

---

## References

- [Overview Document: REQ-356](/docs/REQ-356-update-srcapploginloginpagecontenttsx-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-356)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [i18n Configuration](/src/lib/i18n/config.ts)

---

*Document generated for FAQBNB L10N Epic 2 - Task 2A.2*
*Detailed breakdown created: 2026-01-19 13:15 UTC*
