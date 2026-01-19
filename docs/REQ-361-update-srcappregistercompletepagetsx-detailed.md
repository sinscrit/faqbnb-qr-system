# Detailed Task Breakdown: REQ-361 - Update Registration Complete Page for Internationalization

**Generated:** 2026-01-19 12:45:00 UTC
**Last Modified:** 2026-01-19 12:45:00 UTC
**Request Reference:** REQ-361 (docs/gen_requests_epic2.md)
**Overview Document:** REQ-361-update-srcappregistercompletepagetsx-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.8
**Size:** M (Medium)
**Priority:** P1

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for internationalizing the registration complete page (`/src/app/register/complete/page.tsx`). This page handles "orphaned" OAuth users who completed Google sign-in but need to provide an access code to complete their registration.

**Total Hardcoded Strings:** 27
**Estimated Implementation Time:** ~55 minutes
**Components Affected:** 3 (`LoadingFallback`, `CompleteRegistrationContent`, `CompleteRegistrationPage`)

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] Translation files exist at `/messages/*.json`
- [ ] `useTranslations` hook is available from `next-intl`
- [ ] Reference implementation reviewed: `/src/components/LogoutButton.tsx`
- [ ] Task 2A.1 (auth namespace structure) is ideally completed first

---

## Task Breakdown

### Task 1: Add useTranslations Import Statement

**File:** `/src/app/register/complete/page.tsx`
**Line:** 7 (add after existing imports)
**Effort:** 1 minute
**Story Points:** 0.5

**Implementation:**

Add the following import statement after the existing React imports:

```typescript
import { useTranslations } from 'next-intl';
```

**Location in file:**
```typescript
'use client';

// Complete Registration Page
// Handles "orphaned" auth users who completed OAuth but didn't finish app registration
// Last Modified: 2026-01-19

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';  // <-- ADD THIS LINE
import Link from 'next/link';
// ... rest of imports
```

**Verification:**
- [ ] Import statement added without TypeScript errors
- [ ] No duplicate imports

---

### Task 2: Initialize Translation Hook in LoadingFallback Component

**File:** `/src/app/register/complete/page.tsx`
**Lines:** 15-24
**Effort:** 2 minutes
**Story Points:** 0.5

**Current Code:**
```typescript
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
```

**Updated Code:**
```typescript
function LoadingFallback() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    </div>
  );
}
```

**Translation Key Used:**
| Key | English Value | Namespace |
|-----|---------------|-----------|
| `common.loading` | "Loading..." | common |

**Verification:**
- [ ] Hook initialized before return statement
- [ ] Translation key resolves correctly
- [ ] No console warnings

---

### Task 3: Initialize Translation Hooks in CompleteRegistrationContent Component

**File:** `/src/app/register/complete/page.tsx`
**Lines:** 35-43 (inside component, before state declarations)
**Effort:** 2 minutes
**Story Points:** 0.5

**Add after line 38 (after the useAuth destructuring):**
```typescript
function CompleteRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, loading: authLoading, signOut } = useAuth();

  // Add translation hooks
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');

  const [accessCode, setAccessCode] = useState('');
  // ... rest of component
```

**Verification:**
- [ ] Three translation hooks initialized
- [ ] Hooks placed before state declarations
- [ ] No TypeScript errors

---

### Task 4: Add Translation Keys to English Translation File

**File:** `/messages/en.json`
**Effort:** 10 minutes
**Story Points:** 2

**Add the following keys to the `auth` namespace:**

```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    // ... existing keys ...

    "accessCode": {
      "label": "Access Code",
      "placeholder": "Enter your access code",
      "emailHint": "Check your email for the access code from your invitation.",
      "request": "Request Access Code"
    },
    "register": {
      "complete": {
        "subtitle": "Complete Registration",
        "title": "Almost there!",
        "description": "Your Google sign-in was successful, but we need an access code to complete your registration.",
        "signedInAs": "Signed in as:",
        "enterCodeHint": "Enter your access code to complete account setup.",
        "submitButton": "Complete Registration",
        "submitting": "Completing Registration...",
        "wrongAccount": "Wrong account? Sign out and try again.",
        "checkingAuth": "Checking authentication...",
        "success": {
          "title": "Registration Complete!",
          "message": "Your account has been set up successfully.",
          "redirecting": "Redirecting to dashboard..."
        }
      }
    },
    "errors": {
      "noSession": "No valid session found. Please try logging in again.",
      "registrationFailed": "Registration failed. Please try again."
    }
  }
}
```

**Add the following keys to the `common` namespace:**

```json
{
  "common": {
    // ... existing keys ...
    "backToHome": "Back to Home",
    "logoAlt": "FAQBNB Logo",
    "copyright": "{year} FAQBNB. All rights reserved."
  }
}
```

**New Keys Summary (24 keys):**
| Key Path | English Value |
|----------|---------------|
| `auth.accessCode.label` | Access Code |
| `auth.accessCode.placeholder` | Enter your access code |
| `auth.accessCode.emailHint` | Check your email for the access code from your invitation. |
| `auth.accessCode.request` | Request Access Code |
| `auth.register.complete.subtitle` | Complete Registration |
| `auth.register.complete.title` | Almost there! |
| `auth.register.complete.description` | Your Google sign-in was successful, but we need an access code to complete your registration. |
| `auth.register.complete.signedInAs` | Signed in as: |
| `auth.register.complete.enterCodeHint` | Enter your access code to complete account setup. |
| `auth.register.complete.submitButton` | Complete Registration |
| `auth.register.complete.submitting` | Completing Registration... |
| `auth.register.complete.wrongAccount` | Wrong account? Sign out and try again. |
| `auth.register.complete.checkingAuth` | Checking authentication... |
| `auth.register.complete.success.title` | Registration Complete! |
| `auth.register.complete.success.message` | Your account has been set up successfully. |
| `auth.register.complete.success.redirecting` | Redirecting to dashboard... |
| `auth.errors.noSession` | No valid session found. Please try logging in again. |
| `auth.errors.registrationFailed` | Registration failed. Please try again. |
| `common.backToHome` | Back to Home |
| `common.logoAlt` | FAQBNB Logo |
| `common.copyright` | {year} FAQBNB. All rights reserved. |

**Verification:**
- [ ] JSON syntax is valid
- [ ] Keys follow namespace.component.element pattern
- [ ] No duplicate keys

---

### Task 5: Replace Auth Loading State String

**File:** `/src/app/register/complete/page.tsx`
**Lines:** 142-151
**Effort:** 2 minutes
**Story Points:** 0.5

**Current Code:**
```typescript
if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
}
```

**Updated Code:**
```typescript
if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('register.complete.checkingAuth')}</p>
      </div>
    </div>
  );
}
```

**Verification:**
- [ ] String replaced with translation key
- [ ] Loading state displays correctly

---

### Task 6: Replace Success State Strings

**File:** `/src/app/register/complete/page.tsx`
**Lines:** 154-167
**Effort:** 3 minutes
**Story Points:** 0.5

**Current Code:**
```typescript
if (success) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
          <p className="text-gray-600 mb-4">Your account has been set up successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    </div>
  );
}
```

**Updated Code:**
```typescript
if (success) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('register.complete.success.title')}</h2>
          <p className="text-gray-600 mb-4">{t('register.complete.success.message')}</p>
          <p className="text-sm text-gray-500">{t('register.complete.success.redirecting')}</p>
        </div>
      </div>
    </div>
  );
}
```

**Strings Replaced:**
| Original | Translation Key |
|----------|-----------------|
| "Registration Complete!" | `t('register.complete.success.title')` |
| "Your account has been set up successfully." | `t('register.complete.success.message')` |
| "Redirecting to dashboard..." | `t('register.complete.success.redirecting')` |

**Verification:**
- [ ] All three success state strings replaced
- [ ] Success state displays correctly after registration

---

### Task 7: Replace Page Header Strings

**File:** `/src/app/register/complete/page.tsx`
**Lines:** 173-194
**Effort:** 4 minutes
**Story Points:** 1

**Current Code:**
```typescript
<Link href="/" className="inline-flex items-center space-x-3 mb-6">
  <Image
    src="/faqbnb_logoshort.png"
    alt="FAQBNB Logo"
    width={48}
    height={48}
    className="rounded-lg"
  />
  <div className="text-left">
    <h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
    <p className="text-sm text-gray-600">Complete Registration</p>
  </div>
</Link>

<h2 className="text-3xl font-bold text-gray-900">
  Almost there!
</h2>
<p className="mt-2 text-sm text-gray-600">
  Your Google sign-in was successful, but we need an access code to complete your registration.
</p>
```

**Updated Code:**
```typescript
<Link href="/" className="inline-flex items-center space-x-3 mb-6">
  <Image
    src="/faqbnb_logoshort.png"
    alt={tCommon('logoAlt')}
    width={48}
    height={48}
    className="rounded-lg"
  />
  <div className="text-left">
    <h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
    <p className="text-sm text-gray-600">{t('register.complete.subtitle')}</p>
  </div>
</Link>

<h2 className="text-3xl font-bold text-gray-900">
  {t('register.complete.title')}
</h2>
<p className="mt-2 text-sm text-gray-600">
  {t('register.complete.description')}
</p>
```

**Strings Replaced:**
| Original | Translation Key |
|----------|-----------------|
| "FAQBNB Logo" (alt text) | `tCommon('logoAlt')` |
| "Complete Registration" | `t('register.complete.subtitle')` |
| "Almost there!" | `t('register.complete.title')` |
| "Your Google sign-in was successful..." | `t('register.complete.description')` |

**Note:** "FAQBNB" brand name remains hardcoded (brand names typically are not translated).

**Verification:**
- [ ] All header strings replaced
- [ ] Image alt text uses translation
- [ ] Layout unchanged

---

### Task 8: Replace Info Banner Strings

**File:** `/src/app/register/complete/page.tsx`
**Lines:** 199-210
**Effort:** 2 minutes
**Story Points:** 0.5

**Current Code:**
```typescript
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
  <div className="flex">
    <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
    <div className="ml-3">
      <p className="text-sm text-blue-800">
        <strong>Signed in as:</strong> {emailFromUrl}
      </p>
      <p className="text-xs text-blue-600 mt-1">
        Enter your access code to complete account setup.
      </p>
    </div>
  </div>
</div>
```

**Updated Code:**
```typescript
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
  <div className="flex">
    <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
    <div className="ml-3">
      <p className="text-sm text-blue-800">
        <strong>{t('register.complete.signedInAs')}</strong> {emailFromUrl}
      </p>
      <p className="text-xs text-blue-600 mt-1">
        {t('register.complete.enterCodeHint')}
      </p>
    </div>
  </div>
</div>
```

**Strings Replaced:**
| Original | Translation Key |
|----------|-----------------|
| "Signed in as:" | `t('register.complete.signedInAs')` |
| "Enter your access code to complete account setup." | `t('register.complete.enterCodeHint')` |

**Verification:**
- [ ] Both banner strings replaced
- [ ] Dynamic email value still displays correctly
- [ ] Banner styling unchanged

---

### Task 9: Replace Form Label and Placeholder Strings

**File:** `/src/app/register/complete/page.tsx`
**Lines:** 226-247
**Effort:** 3 minutes
**Story Points:** 0.5

**Current Code:**
```typescript
<div>
  <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
    Access Code
  </label>
  <div className="mt-1">
    <input
      type="text"
      id="accessCode"
      name="accessCode"
      value={accessCode}
      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
      placeholder="Enter your access code"
      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono tracking-wider"
      required
      disabled={isSubmitting}
    />
  </div>
  <p className="mt-2 text-xs text-gray-500">
    Check your email for the access code from your invitation.
  </p>
</div>
```

**Updated Code:**
```typescript
<div>
  <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
    {t('accessCode.label')}
  </label>
  <div className="mt-1">
    <input
      type="text"
      id="accessCode"
      name="accessCode"
      value={accessCode}
      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
      placeholder={t('accessCode.placeholder')}
      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono tracking-wider"
      required
      disabled={isSubmitting}
    />
  </div>
  <p className="mt-2 text-xs text-gray-500">
    {t('accessCode.emailHint')}
  </p>
</div>
```

**Strings Replaced:**
| Original | Translation Key |
|----------|-----------------|
| "Access Code" | `t('accessCode.label')` |
| "Enter your access code" | `t('accessCode.placeholder')` |
| "Check your email for the access code from your invitation." | `t('accessCode.emailHint')` |

**Verification:**
- [ ] Label uses translation
- [ ] Placeholder attribute uses translation
- [ ] Helper text uses translation
- [ ] Form functionality unchanged

---

### Task 10: Replace Submit Button Strings

**File:** `/src/app/register/complete/page.tsx`
**Lines:** 249-264
**Effort:** 2 minutes
**Story Points:** 0.5

**Current Code:**
```typescript
<button
  type="submit"
  disabled={isSubmitting || !accessCode}
  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Completing Registration...
    </>
  ) : (
    'Complete Registration'
  )}
</button>
```

**Updated Code:**
```typescript
<button
  type="submit"
  disabled={isSubmitting || !accessCode}
  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      {t('register.complete.submitting')}
    </>
  ) : (
    t('register.complete.submitButton')
  )}
</button>
```

**Strings Replaced:**
| Original | Translation Key |
|----------|-----------------|
| "Completing Registration..." | `t('register.complete.submitting')` |
| "Complete Registration" | `t('register.complete.submitButton')` |

**Verification:**
- [ ] Both button states use translations
- [ ] Loading spinner still displays
- [ ] Button still functions correctly

---

### Task 11: Replace Sign Out Section Strings

**File:** `/src/app/register/complete/page.tsx`
**Lines:** 267-279
**Effort:** 2 minutes
**Story Points:** 0.5

**Current Code:**
```typescript
<div className="mt-6 pt-6 border-t border-gray-200">
  <p className="text-xs text-gray-500 text-center mb-3">
    Wrong account? Sign out and try again.
  </p>
  <button
    onClick={handleSignOut}
    className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    <LogOut className="h-4 w-4 mr-2" />
    Sign Out
  </button>
</div>
```

**Updated Code:**
```typescript
<div className="mt-6 pt-6 border-t border-gray-200">
  <p className="text-xs text-gray-500 text-center mb-3">
    {t('register.complete.wrongAccount')}
  </p>
  <button
    onClick={handleSignOut}
    className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    <LogOut className="h-4 w-4 mr-2" />
    {t('signOut')}
  </button>
</div>
```

**Strings Replaced:**
| Original | Translation Key |
|----------|-----------------|
| "Wrong account? Sign out and try again." | `t('register.complete.wrongAccount')` |
| "Sign Out" | `t('signOut')` |

**Note:** `signOut` key already exists in the auth namespace, so reuse it.

**Verification:**
- [ ] Both sign out section strings replaced
- [ ] Sign out functionality works correctly

---

### Task 12: Replace Footer Link Strings

**File:** `/src/app/register/complete/page.tsx`
**Lines:** 283-305
**Effort:** 3 minutes
**Story Points:** 0.5

**Current Code:**
```typescript
<div className="mt-8 text-center">
  <div className="flex items-center justify-center space-x-6">
    <Link
      href="/"
      className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
    >
      <Home className="w-4 h-4 mr-1" />
      Back to Home
    </Link>
    <Link
      href="/request-access"
      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
    >
      Request Access Code
    </Link>
  </div>

  <div className="mt-4">
    <p className="text-xs text-gray-500">
      2024 FAQBNB. All rights reserved.
    </p>
  </div>
</div>
```

**Updated Code:**
```typescript
<div className="mt-8 text-center">
  <div className="flex items-center justify-center space-x-6">
    <Link
      href="/"
      className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
    >
      <Home className="w-4 h-4 mr-1" />
      {tCommon('backToHome')}
    </Link>
    <Link
      href="/request-access"
      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
    >
      {t('accessCode.request')}
    </Link>
  </div>

  <div className="mt-4">
    <p className="text-xs text-gray-500">
      {tCommon('copyright', { year: new Date().getFullYear() })}
    </p>
  </div>
</div>
```

**Strings Replaced:**
| Original | Translation Key |
|----------|-----------------|
| "Back to Home" | `tCommon('backToHome')` |
| "Request Access Code" | `t('accessCode.request')` |
| "2024 FAQBNB. All rights reserved." | `tCommon('copyright', { year: new Date().getFullYear() })` |

**Note:** The copyright uses ICU message format with dynamic year interpolation.

**Verification:**
- [ ] All footer strings replaced
- [ ] Dynamic year displays correctly
- [ ] Links still function

---

### Task 13: Update Error Message Handling

**File:** `/src/app/register/complete/page.tsx`
**Lines:** 83-86, 122, 126
**Effort:** 5 minutes
**Story Points:** 1

This task requires careful handling as error messages are thrown/set in multiple places.

**Change 1 - Line 85 (no session error):**

**Current Code:**
```typescript
if (!session?.access_token) {
  throw new Error('No valid session found. Please try logging in again.');
}
```

**Updated Code:**
```typescript
if (!session?.access_token) {
  throw new Error(t('errors.noSession'));
}
```

**Change 2 - Line 122 (API error fallback):**

**Current Code:**
```typescript
setError(result.error || 'Registration failed. Please try again.');
```

**Updated Code:**
```typescript
setError(result.error || t('errors.registrationFailed'));
```

**Change 3 - Line 126 (generic catch error):**

**Current Code:**
```typescript
setError(err instanceof Error ? err.message : 'An unexpected error occurred');
```

**Updated Code:**
```typescript
setError(err instanceof Error ? err.message : tErrors('genericError'));
```

**Strings Replaced:**
| Original | Translation Key |
|----------|-----------------|
| "No valid session found. Please try logging in again." | `t('errors.noSession')` |
| "Registration failed. Please try again." | `t('errors.registrationFailed')` |
| "An unexpected error occurred" | `tErrors('genericError')` |

**Note:** The `genericError` key already exists in the `errors` namespace, so we use `tErrors` hook.

**Verification:**
- [ ] All error scenarios use translation keys
- [ ] Error messages display correctly
- [ ] Error state can be cleared and re-triggered

---

### Task 14: Add Translations to Other Language Files

**Files:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Effort:** 10 minutes
**Story Points:** 2

Add translated versions of all new keys to each language file:

**French (`/messages/fr.json`):**
```json
{
  "auth": {
    "accessCode": {
      "label": "Code d'accès",
      "placeholder": "Entrez votre code d'accès",
      "emailHint": "Vérifiez votre email pour le code d'accès de votre invitation.",
      "request": "Demander un code d'accès"
    },
    "register": {
      "complete": {
        "subtitle": "Compléter l'inscription",
        "title": "Presque terminé !",
        "description": "Votre connexion Google a réussi, mais nous avons besoin d'un code d'accès pour compléter votre inscription.",
        "signedInAs": "Connecté en tant que :",
        "enterCodeHint": "Entrez votre code d'accès pour terminer la configuration du compte.",
        "submitButton": "Compléter l'inscription",
        "submitting": "Inscription en cours...",
        "wrongAccount": "Mauvais compte ? Déconnectez-vous et réessayez.",
        "checkingAuth": "Vérification de l'authentification...",
        "success": {
          "title": "Inscription terminée !",
          "message": "Votre compte a été configuré avec succès.",
          "redirecting": "Redirection vers le tableau de bord..."
        }
      }
    },
    "errors": {
      "noSession": "Aucune session valide trouvée. Veuillez vous reconnecter.",
      "registrationFailed": "L'inscription a échoué. Veuillez réessayer."
    }
  },
  "common": {
    "backToHome": "Retour à l'accueil",
    "logoAlt": "Logo FAQBNB",
    "copyright": "{year} FAQBNB. Tous droits réservés."
  }
}
```

**Spanish (`/messages/es.json`):**
```json
{
  "auth": {
    "accessCode": {
      "label": "Código de acceso",
      "placeholder": "Ingrese su código de acceso",
      "emailHint": "Revise su correo electrónico para el código de acceso de su invitación.",
      "request": "Solicitar código de acceso"
    },
    "register": {
      "complete": {
        "subtitle": "Completar registro",
        "title": "¡Ya casi!",
        "description": "Su inicio de sesión con Google fue exitoso, pero necesitamos un código de acceso para completar su registro.",
        "signedInAs": "Conectado como:",
        "enterCodeHint": "Ingrese su código de acceso para completar la configuración de la cuenta.",
        "submitButton": "Completar registro",
        "submitting": "Completando registro...",
        "wrongAccount": "¿Cuenta incorrecta? Cierre sesión e intente de nuevo.",
        "checkingAuth": "Verificando autenticación...",
        "success": {
          "title": "¡Registro completado!",
          "message": "Su cuenta se ha configurado correctamente.",
          "redirecting": "Redirigiendo al panel de control..."
        }
      }
    },
    "errors": {
      "noSession": "No se encontró una sesión válida. Por favor, inicie sesión de nuevo.",
      "registrationFailed": "El registro falló. Por favor, intente de nuevo."
    }
  },
  "common": {
    "backToHome": "Volver al inicio",
    "logoAlt": "Logo de FAQBNB",
    "copyright": "{year} FAQBNB. Todos los derechos reservados."
  }
}
```

**German (`/messages/de.json`):**
```json
{
  "auth": {
    "accessCode": {
      "label": "Zugangscode",
      "placeholder": "Geben Sie Ihren Zugangscode ein",
      "emailHint": "Überprüfen Sie Ihre E-Mail auf den Zugangscode aus Ihrer Einladung.",
      "request": "Zugangscode anfordern"
    },
    "register": {
      "complete": {
        "subtitle": "Registrierung abschließen",
        "title": "Fast geschafft!",
        "description": "Ihre Google-Anmeldung war erfolgreich, aber wir benötigen einen Zugangscode, um Ihre Registrierung abzuschließen.",
        "signedInAs": "Angemeldet als:",
        "enterCodeHint": "Geben Sie Ihren Zugangscode ein, um die Kontoeinrichtung abzuschließen.",
        "submitButton": "Registrierung abschließen",
        "submitting": "Registrierung wird abgeschlossen...",
        "wrongAccount": "Falsches Konto? Abmelden und erneut versuchen.",
        "checkingAuth": "Authentifizierung wird überprüft...",
        "success": {
          "title": "Registrierung abgeschlossen!",
          "message": "Ihr Konto wurde erfolgreich eingerichtet.",
          "redirecting": "Weiterleitung zum Dashboard..."
        }
      }
    },
    "errors": {
      "noSession": "Keine gültige Sitzung gefunden. Bitte melden Sie sich erneut an.",
      "registrationFailed": "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut."
    }
  },
  "common": {
    "backToHome": "Zurück zur Startseite",
    "logoAlt": "FAQBNB Logo",
    "copyright": "{year} FAQBNB. Alle Rechte vorbehalten."
  }
}
```

**Dutch (`/messages/nl.json`):**
```json
{
  "auth": {
    "accessCode": {
      "label": "Toegangscode",
      "placeholder": "Voer uw toegangscode in",
      "emailHint": "Controleer uw e-mail voor de toegangscode uit uw uitnodiging.",
      "request": "Toegangscode aanvragen"
    },
    "register": {
      "complete": {
        "subtitle": "Registratie voltooien",
        "title": "Bijna klaar!",
        "description": "Uw Google-aanmelding was succesvol, maar we hebben een toegangscode nodig om uw registratie te voltooien.",
        "signedInAs": "Ingelogd als:",
        "enterCodeHint": "Voer uw toegangscode in om de accountconfiguratie te voltooien.",
        "submitButton": "Registratie voltooien",
        "submitting": "Registratie wordt voltooid...",
        "wrongAccount": "Verkeerd account? Uitloggen en opnieuw proberen.",
        "checkingAuth": "Authenticatie controleren...",
        "success": {
          "title": "Registratie voltooid!",
          "message": "Uw account is succesvol ingesteld.",
          "redirecting": "Doorsturen naar dashboard..."
        }
      }
    },
    "errors": {
      "noSession": "Geen geldige sessie gevonden. Log opnieuw in.",
      "registrationFailed": "Registratie mislukt. Probeer het opnieuw."
    }
  },
  "common": {
    "backToHome": "Terug naar home",
    "logoAlt": "FAQBNB Logo",
    "copyright": "{year} FAQBNB. Alle rechten voorbehouden."
  }
}
```

**Italian (`/messages/it.json`):**
```json
{
  "auth": {
    "accessCode": {
      "label": "Codice di accesso",
      "placeholder": "Inserisci il tuo codice di accesso",
      "emailHint": "Controlla la tua email per il codice di accesso dal tuo invito.",
      "request": "Richiedi codice di accesso"
    },
    "register": {
      "complete": {
        "subtitle": "Completa la registrazione",
        "title": "Quasi fatto!",
        "description": "L'accesso con Google è riuscito, ma abbiamo bisogno di un codice di accesso per completare la registrazione.",
        "signedInAs": "Connesso come:",
        "enterCodeHint": "Inserisci il tuo codice di accesso per completare la configurazione dell'account.",
        "submitButton": "Completa la registrazione",
        "submitting": "Completamento registrazione...",
        "wrongAccount": "Account sbagliato? Disconnettiti e riprova.",
        "checkingAuth": "Verifica autenticazione...",
        "success": {
          "title": "Registrazione completata!",
          "message": "Il tuo account è stato configurato con successo.",
          "redirecting": "Reindirizzamento alla dashboard..."
        }
      }
    },
    "errors": {
      "noSession": "Nessuna sessione valida trovata. Effettua nuovamente l'accesso.",
      "registrationFailed": "Registrazione fallita. Per favore riprova."
    }
  },
  "common": {
    "backToHome": "Torna alla home",
    "logoAlt": "Logo FAQBNB",
    "copyright": "{year} FAQBNB. Tutti i diritti riservati."
  }
}
```

**Verification:**
- [ ] All 5 language files updated
- [ ] JSON syntax valid in all files
- [ ] Key structure matches English file
- [ ] No missing keys in any language

---

### Task 15: Update Last Modified Comment

**File:** `/src/app/register/complete/page.tsx`
**Line:** 5
**Effort:** 1 minute
**Story Points:** 0.25

**Current Code:**
```typescript
// Last Modified: 2026-01-16
```

**Updated Code:**
```typescript
// Last Modified: 2026-01-19
```

**Verification:**
- [ ] Date updated to current date

---

## Verification & Testing Checklist

### Build Verification
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors related to translation keys
- [ ] No ESLint warnings for unused imports

### Functional Testing
- [ ] Page loads correctly in English locale
- [ ] OAuth flow still works correctly after changes
- [ ] Access code submission works with translated UI
- [ ] Success state displays correctly with translations
- [ ] Error messages display correctly with translations
- [ ] Dashboard redirect after success works
- [ ] Login redirect for unauthenticated users works
- [ ] Sign out functionality works correctly

### i18n Testing
- [ ] No hardcoded English strings remain in component
- [ ] All translation keys resolve correctly
- [ ] No console warnings about missing translation keys
- [ ] Dynamic values (email, year) interpolate correctly
- [ ] Page displays correctly in all 6 supported languages
- [ ] Test en, fr, es, de, nl, it locales

### Visual/Layout Testing
- [ ] Layout unchanged after string replacement
- [ ] No text overflow or truncation issues
- [ ] Buttons accommodate longer translated text (German tends to be longest)
- [ ] Form layout remains consistent across languages
- [ ] Mobile responsiveness maintained

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Task | Status |
|---------------------|------|--------|
| Page subtitle "Complete Registration" uses translation key | Task 7 | [ ] |
| Main heading "Almost there!" uses translation key | Task 7 | [ ] |
| Instructional paragraph uses translation key | Task 7 | [ ] |
| Info banner "Signed in as:" uses translation key | Task 8 | [ ] |
| Info banner helper text uses translation key | Task 8 | [ ] |
| Access code form field label uses translation key | Task 9 | [ ] |
| Access code input placeholder uses translation key | Task 9 | [ ] |
| Access code helper text uses translation key | Task 9 | [ ] |
| Submit button "Complete Registration" uses translation key | Task 10 | [ ] |
| Loading button "Completing Registration..." uses translation key | Task 10 | [ ] |
| Sign-out section prompt uses translation key | Task 11 | [ ] |
| "Sign Out" button uses translation key | Task 11 | [ ] |
| Error messages use translation keys with dynamic support | Task 13 | [ ] |
| Success state heading uses translation key | Task 6 | [ ] |
| Success state message uses translation key | Task 6 | [ ] |
| Success redirect notice uses translation key | Task 6 | [ ] |
| Footer "Back to Home" uses translation key | Task 12 | [ ] |
| Footer "Request Access Code" uses translation key | Task 12 | [ ] |
| Footer copyright uses translation key with dynamic year | Task 12 | [ ] |
| Loading "Loading..." uses translation key | Task 2 | [ ] |
| Auth checking message uses translation key | Task 5 | [ ] |
| Component uses useTranslations hook | Tasks 1-3 | [ ] |
| OAuth flows function correctly | Testing | [ ] |
| Form validation works with translated content | Testing | [ ] |
| Dashboard redirect works | Testing | [ ] |
| Login redirect for unauthenticated works | Testing | [ ] |
| Styling and layout maintained | Testing | [ ] |
| Translation keys follow naming conventions | Task 4 | [ ] |
| TypeScript compilation succeeds | Build | [ ] |
| No console errors for missing keys | Testing | [ ] |
| Alt text for logo uses translation key | Task 7 | [ ] |

---

## Files Modified Summary

### Primary File
| File Path | Modification Type |
|-----------|-------------------|
| `/src/app/register/complete/page.tsx` | Add imports, initialize hooks, replace 27 hardcoded strings |

### Translation Files
| File Path | Modification Type |
|-----------|-------------------|
| `/messages/en.json` | Add 24 new translation keys |
| `/messages/fr.json` | Add French translations |
| `/messages/es.json` | Add Spanish translations |
| `/messages/de.json` | Add German translations |
| `/messages/nl.json` | Add Dutch translations |
| `/messages/it.json` | Add Italian translations |

### Files NOT to Modify
- `/src/contexts/AuthContext.tsx` - Auth logic unchanged
- `/src/app/api/auth/complete-oauth-registration/route.ts` - API endpoint unchanged
- Any other files outside scope

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys at runtime | Low | Medium | Build-time verification, English fallback |
| Breaking OAuth flow | Low | High | Functional testing, no logic changes |
| Layout issues with longer text | Medium | Low | Test with German (typically longest) |
| TypeScript errors | Low | Low | Use established patterns from LogoutButton |
| Error messages not translating correctly | Low | Medium | Test all error scenarios |

---

## Implementation Order

Execute tasks in this order for optimal flow:

1. **Task 1:** Add import statement
2. **Task 2:** Initialize hook in LoadingFallback
3. **Task 3:** Initialize hooks in CompleteRegistrationContent
4. **Task 4:** Add translation keys to en.json
5. **Tasks 5-13:** Replace strings in component (can be done in parallel)
6. **Task 14:** Add translations to other language files
7. **Task 15:** Update last modified comment
8. **Verification:** Run all testing checks

---

## References

- [Overview Document](/docs/REQ-361-update-srcappregistercompletepagetsx-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request: REQ-361](/docs/gen_requests_epic2.md#REQ-361)
- [Reference Implementation: LogoutButton](/src/components/LogoutButton.tsx)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Current Translation File](/messages/en.json)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2A.8 - Update Registration Complete Page*
