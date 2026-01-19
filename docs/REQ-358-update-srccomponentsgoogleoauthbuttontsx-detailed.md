# REQ-358: Update GoogleOAuthButton.tsx for Internationalization - Detailed Task Breakdown

**Created:** 2026-01-19 19:15 UTC
**Last Modified:** 2026-01-19 19:15 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.5
**Request Type:** ENHANCEMENT
**Size:** S (Small)
**Priority:** P1 - High
**Status:** Ready for Implementation

---

## Document Overview

This detailed task breakdown document provides step-by-step implementation instructions for internationalizing the `GoogleOAuthButton.tsx` component. Each task is designed to be approximately 1 story point or less and can be completed independently while maintaining a logical implementation sequence.

**Source Documents:**
- Overview: `/docs/REQ-358-update-srccomponentsgoogleoauthbuttontsx-overview.md`
- Requirements: `/docs/gen_requests_epic2.md` (REQ-358)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

---

## Prerequisites

Before beginning implementation, verify:

- [x] Epic 1 Foundation complete (next-intl installed and configured)
- [x] IntlProvider wrapper configured in `/src/app/layout.tsx`
- [x] Base translation files exist in `/messages/*.json`
- [x] `useTranslations` hook available from `next-intl`

---

## Task List Summary

| Task # | Title | Estimate | Dependencies |
|--------|-------|----------|--------------|
| 1 | Add auth.google namespace to English translation file | Trivial | None |
| 2 | Add auth.google translations to French file | Trivial | Task 1 |
| 3 | Add auth.google translations to Spanish file | Trivial | Task 1 |
| 4 | Add auth.google translations to German file | Trivial | Task 1 |
| 5 | Add auth.google translations to Dutch file | Trivial | Task 1 |
| 6 | Add auth.google translations to Italian file | Trivial | Task 1 |
| 7 | Add useTranslations import to GoogleOAuthButton | Trivial | Task 1-6 |
| 8 | Initialize translation hook in component | Trivial | Task 7 |
| 9 | Replace rate limit error message with translation | Small | Task 8 |
| 10 | Replace generic error message with translation | Trivial | Task 8 |
| 11 | Replace aria-label with translation | Trivial | Task 8 |
| 12 | Replace loading state text with translation | Trivial | Task 8 |
| 13 | Replace button label with translation | Trivial | Task 8 |
| 14 | Manual testing and verification | Small | Task 9-13 |

---

## Detailed Task Specifications

### Task 1: Add auth.google Namespace to English Translation File

**File:** `/messages/en.json`
**Estimate:** Trivial
**Type:** Translation File Update

**Description:**
Add the `auth.google` namespace with all required translation keys to the English translation file. This serves as the source of truth for all other language translations.

**Implementation Steps:**

1. Open `/messages/en.json`
2. Locate the `auth` object (currently exists with basic auth keys)
3. Add a new `google` object inside the `auth` namespace
4. Include all required translation keys with ICU plural formatting for the rate limit message

**Code Change:**

Find the `auth` object in `/messages/en.json` and add the `google` namespace:

```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    ...existing keys...,
    "google": {
      "button": "Continue with Google",
      "connecting": "Connecting to Google...",
      "ariaLabel": "Continue with Google",
      "error": {
        "rateLimited": "Too many authentication attempts. Please try again in {minutes} {minutes, plural, one {minute} other {minutes}}.",
        "unexpected": "An unexpected error occurred"
      }
    }
  }
}
```

**Verification:**
- JSON file parses without errors
- All 5 translation keys are present under `auth.google`
- ICU plural format is syntactically correct

---

### Task 2: Add auth.google Translations to French File

**File:** `/messages/fr.json`
**Estimate:** Trivial
**Type:** Translation File Update

**Description:**
Add French translations for all `auth.google` namespace keys.

**Implementation Steps:**

1. Open `/messages/fr.json`
2. Locate or create the `auth` object
3. Add the `google` namespace with French translations

**Code Change:**

```json
{
  "auth": {
    ...existing keys...,
    "google": {
      "button": "Continuer avec Google",
      "connecting": "Connexion a Google...",
      "ariaLabel": "Continuer avec Google",
      "error": {
        "rateLimited": "Trop de tentatives d'authentification. Veuillez reessayer dans {minutes} {minutes, plural, one {minute} other {minutes}}.",
        "unexpected": "Une erreur inattendue s'est produite"
      }
    }
  }
}
```

**Verification:**
- JSON file parses without errors
- Key structure matches English file exactly

---

### Task 3: Add auth.google Translations to Spanish File

**File:** `/messages/es.json`
**Estimate:** Trivial
**Type:** Translation File Update

**Description:**
Add Spanish translations for all `auth.google` namespace keys.

**Implementation Steps:**

1. Open `/messages/es.json`
2. Locate or create the `auth` object
3. Add the `google` namespace with Spanish translations

**Code Change:**

```json
{
  "auth": {
    ...existing keys...,
    "google": {
      "button": "Continuar con Google",
      "connecting": "Conectando con Google...",
      "ariaLabel": "Continuar con Google",
      "error": {
        "rateLimited": "Demasiados intentos de autenticacion. Por favor, intentalo de nuevo en {minutes} {minutes, plural, one {minuto} other {minutos}}.",
        "unexpected": "Se produjo un error inesperado"
      }
    }
  }
}
```

**Verification:**
- JSON file parses without errors
- Key structure matches English file exactly
- Spanish plural form (`minuto`/`minutos`) is correct

---

### Task 4: Add auth.google Translations to German File

**File:** `/messages/de.json`
**Estimate:** Trivial
**Type:** Translation File Update

**Description:**
Add German translations for all `auth.google` namespace keys.

**Implementation Steps:**

1. Open `/messages/de.json`
2. Locate or create the `auth` object
3. Add the `google` namespace with German translations

**Code Change:**

```json
{
  "auth": {
    ...existing keys...,
    "google": {
      "button": "Mit Google fortfahren",
      "connecting": "Verbindung zu Google wird hergestellt...",
      "ariaLabel": "Mit Google fortfahren",
      "error": {
        "rateLimited": "Zu viele Authentifizierungsversuche. Bitte versuchen Sie es in {minutes} {minutes, plural, one {Minute} other {Minuten}} erneut.",
        "unexpected": "Ein unerwarteter Fehler ist aufgetreten"
      }
    }
  }
}
```

**Verification:**
- JSON file parses without errors
- Key structure matches English file exactly
- German plural form (`Minute`/`Minuten`) is correct

---

### Task 5: Add auth.google Translations to Dutch File

**File:** `/messages/nl.json`
**Estimate:** Trivial
**Type:** Translation File Update

**Description:**
Add Dutch translations for all `auth.google` namespace keys.

**Implementation Steps:**

1. Open `/messages/nl.json`
2. Locate or create the `auth` object
3. Add the `google` namespace with Dutch translations

**Code Change:**

```json
{
  "auth": {
    ...existing keys...,
    "google": {
      "button": "Doorgaan met Google",
      "connecting": "Verbinding maken met Google...",
      "ariaLabel": "Doorgaan met Google",
      "error": {
        "rateLimited": "Te veel authenticatiepogingen. Probeer het opnieuw over {minutes} {minutes, plural, one {minuut} other {minuten}}.",
        "unexpected": "Er is een onverwachte fout opgetreden"
      }
    }
  }
}
```

**Verification:**
- JSON file parses without errors
- Key structure matches English file exactly
- Dutch plural form (`minuut`/`minuten`) is correct

---

### Task 6: Add auth.google Translations to Italian File

**File:** `/messages/it.json`
**Estimate:** Trivial
**Type:** Translation File Update

**Description:**
Add Italian translations for all `auth.google` namespace keys.

**Implementation Steps:**

1. Open `/messages/it.json`
2. Locate or create the `auth` object
3. Add the `google` namespace with Italian translations

**Code Change:**

```json
{
  "auth": {
    ...existing keys...,
    "google": {
      "button": "Continua con Google",
      "connecting": "Connessione a Google...",
      "ariaLabel": "Continua con Google",
      "error": {
        "rateLimited": "Troppi tentativi di autenticazione. Riprova tra {minutes} {minutes, plural, one {minuto} other {minuti}}.",
        "unexpected": "Si e verificato un errore imprevisto"
      }
    }
  }
}
```

**Verification:**
- JSON file parses without errors
- Key structure matches English file exactly
- Italian plural form (`minuto`/`minuti`) is correct

---

### Task 7: Add useTranslations Import to GoogleOAuthButton

**File:** `/src/components/GoogleOAuthButton.tsx`
**Estimate:** Trivial
**Type:** Code Modification

**Description:**
Add the `useTranslations` hook import from `next-intl` to enable translation functionality in the component.

**Implementation Steps:**

1. Open `/src/components/GoogleOAuthButton.tsx`
2. Add the import statement after the existing React import (line 3)

**Code Change:**

**Location:** Line 3 (after `import React, { useState } from 'react';`)

**Before:**
```typescript
'use client';

import React, { useState } from 'react';

/**
```

**After:**
```typescript
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

/**
```

**Verification:**
- File compiles without TypeScript errors
- No import resolution errors

---

### Task 8: Initialize Translation Hook in Component

**File:** `/src/components/GoogleOAuthButton.tsx`
**Estimate:** Trivial
**Type:** Code Modification

**Description:**
Initialize the `useTranslations` hook inside the component function to access the `auth.google` namespace translations.

**Implementation Steps:**

1. Locate the component function start (line 20-27 area)
2. Add the hook initialization after the props destructuring, before state declarations

**Code Change:**

**Location:** Line 27 (after props destructuring, before `const [isLoading, setState] = ...`)

**Before:**
```typescript
export default function GoogleOAuthButton({
  accessCode,
  email,
  onAuthStart,
  onAuthError,
  disabled = false
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
```

**After:**
```typescript
export default function GoogleOAuthButton({
  accessCode,
  email,
  onAuthStart,
  onAuthError,
  disabled = false
}: GoogleOAuthButtonProps) {
  const t = useTranslations('auth.google');
  const [isLoading, setIsLoading] = useState(false);
```

**Verification:**
- File compiles without TypeScript errors
- Hook is called at the top level of the component (React rules of hooks)

---

### Task 9: Replace Rate Limit Error Message with Translation

**File:** `/src/components/GoogleOAuthButton.tsx`
**Estimate:** Small
**Type:** Code Modification

**Description:**
Replace the hardcoded rate limit error message with the translated version using ICU plural interpolation for the minutes value.

**Implementation Steps:**

1. Locate the rate limiting check (lines 40-44)
2. Replace the template literal string with the `t()` function call

**Code Change:**

**Location:** Line 42

**Before:**
```typescript
    if (now - lastAttempt < RATE_LIMIT_WINDOW && attemptCount >= MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
      onAuthError?.(`Too many authentication attempts. Please try again in ${remainingTime} minutes.`);
      return;
    }
```

**After:**
```typescript
    if (now - lastAttempt < RATE_LIMIT_WINDOW && attemptCount >= MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
      onAuthError?.(t('error.rateLimited', { minutes: remainingTime }));
      return;
    }
```

**Verification:**
- File compiles without TypeScript errors
- Rate limiting flow still functions correctly
- Test with 1 minute remaining (singular) and 3 minutes remaining (plural)

---

### Task 10: Replace Generic Error Message with Translation

**File:** `/src/components/GoogleOAuthButton.tsx`
**Estimate:** Trivial
**Type:** Code Modification

**Description:**
Replace the hardcoded generic error fallback message with the translated version.

**Implementation Steps:**

1. Locate the catch block error handling (line 91)
2. Replace the hardcoded string with the `t()` function call

**Code Change:**

**Location:** Line 91

**Before:**
```typescript
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
```

**After:**
```typescript
      const errorMessage = error instanceof Error ? error.message : t('error.unexpected');
```

**Verification:**
- File compiles without TypeScript errors
- Error handling still functions correctly

---

### Task 11: Replace aria-label with Translation

**File:** `/src/components/GoogleOAuthButton.tsx`
**Estimate:** Trivial
**Type:** Code Modification

**Description:**
Replace the hardcoded `aria-label` attribute with the translated version for accessibility.

**Implementation Steps:**

1. Locate the button element's aria-label attribute (line 111)
2. Replace the hardcoded string with a dynamic expression using `t()`

**Code Change:**

**Location:** Line 111

**Before:**
```tsx
      aria-label="Continue with Google"
```

**After:**
```tsx
      aria-label={t('ariaLabel')}
```

**Verification:**
- File compiles without TypeScript errors
- Button remains accessible to screen readers
- Verify aria-label changes with language setting

---

### Task 12: Replace Loading State Text with Translation

**File:** `/src/components/GoogleOAuthButton.tsx`
**Estimate:** Trivial
**Type:** Code Modification

**Description:**
Replace the hardcoded loading state text with the translated version.

**Implementation Steps:**

1. Locate the loading state JSX (line 116)
2. Replace the hardcoded text with a dynamic expression using `t()`

**Code Change:**

**Location:** Line 116

**Before:**
```tsx
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
          <span>Connecting to Google...</span>
        </>
```

**After:**
```tsx
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
          <span>{t('connecting')}</span>
        </>
```

**Verification:**
- File compiles without TypeScript errors
- Loading state displays correctly
- Text changes with language setting

---

### Task 13: Replace Button Label with Translation

**File:** `/src/components/GoogleOAuthButton.tsx`
**Estimate:** Trivial
**Type:** Code Modification

**Description:**
Replace the hardcoded button label text with the translated version.

**Implementation Steps:**

1. Locate the button label text (line 144)
2. Replace the hardcoded text with a dynamic expression using `t()`

**Code Change:**

**Location:** Line 144

**Before:**
```tsx
          <span>Continue with Google</span>
```

**After:**
```tsx
          <span>{t('button')}</span>
```

**Verification:**
- File compiles without TypeScript errors
- Button displays correctly in default state
- Text changes with language setting

---

### Task 14: Manual Testing and Verification

**Estimate:** Small
**Type:** Verification

**Description:**
Perform comprehensive manual testing to verify all internationalization changes work correctly across all supported languages.

**Testing Checklist:**

#### Functional Testing
- [ ] Button renders without errors in English (default)
- [ ] OAuth flow initiates correctly and redirects properly
- [ ] Button disabled state works correctly
- [ ] Loading state displays correctly
- [ ] onAuthStart callback fires at correct time
- [ ] onAuthError callback receives translated error messages

#### Language Testing (Repeat for each: en, fr, es, de, nl, it)
- [ ] Button label "Continue with Google" displays correctly
- [ ] Loading state "Connecting to Google..." displays correctly
- [ ] Trigger rate limit and verify error message displays correctly
- [ ] Verify minute pluralization (test with 1 minute and multiple minutes)

#### Accessibility Testing
- [ ] Screen reader announces translated button label
- [ ] Screen reader announces translated loading state
- [ ] Tab focus works correctly on button
- [ ] Button states (normal, loading, disabled) are all accessible

#### Visual Regression Testing
- [ ] Button styling and layout remain unchanged
- [ ] German text (longer) fits within button without overflow
- [ ] No layout breaks in any language

#### Console Verification
- [ ] No console errors related to missing translations
- [ ] No console warnings about translation keys

**Pass Criteria:**
All checkboxes must be verified for the task to be considered complete.

---

## Final Implementation Reference

After completing all tasks, the modified component should look like this:

```typescript
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Google OAuth Button - Uses direct Google OAuth flow
 * This bypasses Supabase's OAuth so Google shows your app domain in the consent screen
 *
 * Updated: 2026-01-19
 */

interface GoogleOAuthButtonProps {
  accessCode?: string;
  email?: string;
  onAuthStart?: () => void;
  onAuthError?: (error: string) => void;
  disabled?: boolean;
}

export default function GoogleOAuthButton({
  accessCode,
  email,
  onAuthStart,
  onAuthError,
  disabled = false
}: GoogleOAuthButtonProps) {
  const t = useTranslations('auth.google');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  // Rate limiting: max 3 attempts per 5 minutes
  const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
  const MAX_ATTEMPTS = 3;

  const handleOAuthSignIn = async () => {
    if (disabled || isLoading) return;

    // Rate limiting check
    const now = Date.now();
    if (now - lastAttempt < RATE_LIMIT_WINDOW && attemptCount >= MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
      onAuthError?.(t('error.rateLimited', { minutes: remainingTime }));
      return;
    }

    // Reset attempt count if rate limit window has passed
    if (now - lastAttempt >= RATE_LIMIT_WINDOW) {
      setAttemptCount(0);
    }

    try {
      setIsLoading(true);
      setLastAttempt(now);
      setAttemptCount(prev => prev + 1);
      onAuthStart?.();

      // Build redirect URL to our direct Google OAuth API route
      const params = new URLSearchParams();
      if (accessCode) params.set('accessCode', accessCode);
      if (email) params.set('email', email);

      const redirectUrl = `/api/auth/google${params.toString() ? `?${params.toString()}` : ''}`;

      // Redirect to our direct Google OAuth initiation route
      window.location.href = redirectUrl;

    } catch (error) {
      console.error('OAuth error:', error);
      const errorMessage = error instanceof Error ? error.message : t('error.unexpected');
      onAuthError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleOAuthSignIn}
      disabled={disabled || isLoading}
      className={`
        w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg
        shadow-sm bg-white text-gray-700 font-medium transition-all duration-200
        hover:bg-gray-50 hover:border-gray-400 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:shadow-sm
        disabled:grayscale
        ${isLoading ? 'opacity-75' : ''}
      `}
      aria-label={t('ariaLabel')}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
          <span>{t('connecting')}</span>
        </>
      ) : (
        <>
          {/* Google Logo SVG */}
          <svg
            className="w-5 h-5 mr-3"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* SVG paths unchanged */}
          </svg>
          <span>{t('button')}</span>
        </>
      )}
    </button>
  );
}
```

---

## Acceptance Criteria Verification Matrix

| Acceptance Criterion | Task(s) | Verification Method |
|---------------------|---------|---------------------|
| Button label uses translation key | Task 13 | Code review, manual test |
| Loading state uses translation key | Task 12 | Code review, manual test |
| Rate limit error extracted with interpolation | Task 9, Task 1-6 | Code review, manual test |
| Rate limit formats time according to locale | Task 9, Task 1-6 | Manual test (plural forms) |
| Generic error uses translation key | Task 10 | Code review |
| aria-label derived from translation key | Task 11 | Code review, screen reader test |
| Component uses next-intl correctly | Task 7, Task 8 | Code review |
| OAuth flows function correctly | Task 14 | Manual test |
| Button maintains styling/layout | Task 14 | Visual inspection |
| Error callbacks receive localized messages | Task 9, Task 10 | Manual test |
| Translation keys follow namespace convention | Task 1-6 | Code review |
| Component remains accessible | Task 11, Task 14 | Screen reader test |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing translation key at runtime | Build-time verification, all keys defined in Task 1-6 |
| ICU plural format error | Test both singular (1) and plural (>1) cases |
| Button text overflow | German text is ~20% longer; verify visually |
| OAuth flow regression | Full end-to-end test in Task 14 |
| Parent components expect English errors | Document that error callbacks now return localized strings |

---

## References

- [Overview Document](/docs/REQ-358-update-srccomponentsgoogleoauthbuttontsx-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB L10N Epic 2 - Task 2A.5*
*Last Modified: 2026-01-19 19:15 UTC*
