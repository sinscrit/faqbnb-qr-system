# Implementation Breakdown: REQ-326 - Internationalize GoogleOAuthButton Component

**Last Modified:** 2026-01-18 16:00 UTC
**Request ID:** REQ-326
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.5
**Size:** S (Small)
**Priority:** P1 - High

---

## Overview

This document provides a detailed implementation breakdown for internationalizing the `GoogleOAuthButton` component. This is part of Sub-Epic 2A (Authentication & Registration) within the L10N Epic 2 initiative. The component contains approximately 10 hardcoded English strings that need to be replaced with translation function calls referencing keys from the auth namespace.

---

## Current State Analysis

### Component Location
- **File:** `/src/components/GoogleOAuthButton.tsx`
- **Type:** Client Component (`'use client'`)
- **Lines:** ~150
- **Hardcoded Strings:** ~5-6 user-facing strings

### Identified Hardcoded Strings

| String | Location | Context |
|--------|----------|---------|
| `"Continue with Google"` | Line 144 | Default button text |
| `"Connecting to Google..."` | Line 116 | Loading state text |
| `"Continue with Google"` | Line 111 | aria-label attribute |
| `"Too many authentication attempts. Please try again in ${remainingTime} minutes."` | Line 42 | Rate limit error (dynamic) |

### Current Component Structure

```typescript
interface GoogleOAuthButtonProps {
  accessCode?: string;
  email?: string;
  onAuthStart?: () => void;
  onAuthError?: (error: string) => void;
  disabled?: boolean;
}
```

The component:
1. Handles Google OAuth sign-in initiation
2. Implements rate limiting (3 attempts per 5 minutes)
3. Manages loading state during authentication
4. Provides callbacks for auth start and error events
5. Passes through access codes for registration flows

---

## Dependencies

### Required from Epic 1 (Already Complete)
- `next-intl` package installed
- `useTranslations` hook available
- Translation files structure in `/messages/`
- IntlProvider configured in app layout

### Existing Translation Namespace
The `auth` namespace already exists in `/messages/en.json` with a basic structure. We need to extend it with OAuth-specific keys.

---

## Implementation Tasks

### Task 1: Extend Auth Namespace with OAuth Keys

**Effort:** 5 minutes

Add OAuth-specific translation keys to `/messages/en.json`:

```json
{
  "auth": {
    // ... existing keys ...
    "oauth": {
      "google": {
        "continueWith": "Continue with Google",
        "connecting": "Connecting to Google...",
        "rateLimitError": "Too many authentication attempts. Please try again in {minutes} minutes."
      }
    }
  }
}
```

**Files to modify:**
- `/messages/en.json` - Add OAuth keys under auth namespace
- `/messages/fr.json` - Add French translations
- `/messages/es.json` - Add Spanish translations
- `/messages/de.json` - Add German translations
- `/messages/nl.json` - Add Dutch translations
- `/messages/it.json` - Add Italian translations

### Task 2: Update GoogleOAuthButton Component

**Effort:** 10 minutes

#### 2.1 Add Translation Hook Import

```typescript
import { useTranslations } from 'next-intl';
```

#### 2.2 Initialize Translation Hook

Add inside the component function, before state declarations:

```typescript
const t = useTranslations('auth.oauth.google');
```

#### 2.3 Replace Hardcoded Strings

| Current | Replacement |
|---------|-------------|
| `"Continue with Google"` (button text) | `{t('continueWith')}` |
| `"Connecting to Google..."` | `{t('connecting')}` |
| `"Continue with Google"` (aria-label) | `{t('continueWith')}` |
| Rate limit error string | `t('rateLimitError', { minutes: remainingTime })` |

### Task 3: Verify Build and TypeScript Compilation

**Effort:** 5 minutes

- Run `npm run build` to verify no TypeScript errors
- Check for missing translation key warnings
- Verify component renders correctly

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Modification Type | Scope |
|-----------|-------------------|-------|
| `/src/components/GoogleOAuthButton.tsx` | Edit | Add translation hook import, initialize hook, replace hardcoded strings |
| `/messages/en.json` | Edit | Add `auth.oauth.google` namespace with translation keys |
| `/messages/fr.json` | Edit | Add French translations for OAuth keys |
| `/messages/es.json` | Edit | Add Spanish translations for OAuth keys |
| `/messages/de.json` | Edit | Add German translations for OAuth keys |
| `/messages/nl.json` | Edit | Add Dutch translations for OAuth keys |
| `/messages/it.json` | Edit | Add Italian translations for OAuth keys |

### Functions Authorized for Modification

| File | Function/Component | Changes |
|------|-------------------|---------|
| `/src/components/GoogleOAuthButton.tsx` | `GoogleOAuthButton` | Add `useTranslations` hook call, update JSX to use `t()` function |
| `/src/components/GoogleOAuthButton.tsx` | `handleOAuthSignIn` | Update error message to use translation with interpolation |

### Functions NOT to Modify

| File | Function | Reason |
|------|----------|--------|
| `/src/components/GoogleOAuthButton.tsx` | OAuth redirect logic | Core functionality must remain unchanged |
| `/src/components/GoogleOAuthButton.tsx` | Rate limiting logic | Security feature must remain unchanged |

---

## Code Changes Specification

### GoogleOAuthButton.tsx - Final Implementation

```typescript
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

// ... interface definition remains unchanged ...

export default function GoogleOAuthButton({
  accessCode,
  email,
  onAuthStart,
  onAuthError,
  disabled = false
}: GoogleOAuthButtonProps) {
  const t = useTranslations('auth.oauth.google');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  // ... constants remain unchanged ...

  const handleOAuthSignIn = async () => {
    if (disabled || isLoading) return;

    // Rate limiting check
    const now = Date.now();
    if (now - lastAttempt < RATE_LIMIT_WINDOW && attemptCount >= MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
      onAuthError?.(t('rateLimitError', { minutes: remainingTime }));
      return;
    }

    // ... rest of function remains unchanged ...
  };

  return (
    <button
      type="button"
      onClick={handleOAuthSignIn}
      disabled={disabled || isLoading}
      className="..."
      aria-label={t('continueWith')}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
          <span>{t('connecting')}</span>
        </>
      ) : (
        <>
          {/* Google Logo SVG - unchanged */}
          <span>{t('continueWith')}</span>
        </>
      )}
    </button>
  );
}
```

### Translation Keys

#### English (`/messages/en.json`)

```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "signUp": "Sign Up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "continueWithGoogle": "Continue with Google",
    "rememberMe": "Remember me",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "oauth": {
      "google": {
        "continueWith": "Continue with Google",
        "connecting": "Connecting to Google...",
        "rateLimitError": "Too many authentication attempts. Please try again in {minutes} minutes."
      }
    }
  }
}
```

#### French (`/messages/fr.json`)

```json
{
  "auth": {
    "oauth": {
      "google": {
        "continueWith": "Continuer avec Google",
        "connecting": "Connexion à Google...",
        "rateLimitError": "Trop de tentatives d'authentification. Veuillez réessayer dans {minutes} minutes."
      }
    }
  }
}
```

#### Spanish (`/messages/es.json`)

```json
{
  "auth": {
    "oauth": {
      "google": {
        "continueWith": "Continuar con Google",
        "connecting": "Conectando con Google...",
        "rateLimitError": "Demasiados intentos de autenticación. Por favor, inténtelo de nuevo en {minutes} minutos."
      }
    }
  }
}
```

#### German (`/messages/de.json`)

```json
{
  "auth": {
    "oauth": {
      "google": {
        "continueWith": "Mit Google fortfahren",
        "connecting": "Verbindung zu Google...",
        "rateLimitError": "Zu viele Authentifizierungsversuche. Bitte versuchen Sie es in {minutes} Minuten erneut."
      }
    }
  }
}
```

#### Dutch (`/messages/nl.json`)

```json
{
  "auth": {
    "oauth": {
      "google": {
        "continueWith": "Doorgaan met Google",
        "connecting": "Verbinden met Google...",
        "rateLimitError": "Te veel authenticatiepogingen. Probeer het opnieuw over {minutes} minuten."
      }
    }
  }
}
```

#### Italian (`/messages/it.json`)

```json
{
  "auth": {
    "oauth": {
      "google": {
        "continueWith": "Continua con Google",
        "connecting": "Connessione a Google...",
        "rateLimitError": "Troppi tentativi di autenticazione. Riprova tra {minutes} minuti."
      }
    }
  }
}
```

---

## Acceptance Criteria

- [ ] Component imports `useTranslations` from `next-intl`
- [ ] Translation hook is initialized with `'auth.oauth.google'` namespace
- [ ] Button text "Continue with Google" uses translation key `auth.oauth.google.continueWith`
- [ ] Loading state text "Connecting to Google..." uses translation key `auth.oauth.google.connecting`
- [ ] aria-label uses translation key `auth.oauth.google.continueWith`
- [ ] Rate limit error message uses translation key with dynamic `{minutes}` parameter interpolation
- [ ] All corresponding translation keys exist in `/messages/en.json`
- [ ] Translations exist for all 5 non-English languages (fr, es, de, nl, it)
- [ ] Component renders correctly with translations in place
- [ ] TypeScript compilation succeeds with no errors
- [ ] Build process completes successfully
- [ ] OAuth flow functionality remains unchanged (redirect, rate limiting, error handling)
- [ ] Accessibility attributes properly reflect translated content

---

## Testing Plan

### Manual Testing

1. **Visual Verification**
   - Load login page and verify button displays "Continue with Google"
   - Click button and verify loading state shows "Connecting to Google..."

2. **Language Switching**
   - Switch browser/app language to each supported locale
   - Verify button text updates appropriately

3. **Rate Limiting Test**
   - Trigger rate limit (3 rapid attempts)
   - Verify error message displays correctly with minute count
   - Verify error message is translated when language is changed

4. **Accessibility**
   - Use screen reader to verify aria-label is announced correctly
   - Verify aria-label updates when language changes

### Automated Testing (if applicable)

```typescript
// Example test case for translation rendering
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import GoogleOAuthButton from './GoogleOAuthButton';

const messages = {
  auth: {
    oauth: {
      google: {
        continueWith: 'Continue with Google',
        connecting: 'Connecting to Google...',
        rateLimitError: 'Too many attempts. Retry in {minutes} minutes.'
      }
    }
  }
};

describe('GoogleOAuthButton i18n', () => {
  it('renders translated button text', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <GoogleOAuthButton />
      </NextIntlClientProvider>
    );
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });
});
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation causes runtime error | Low | Medium | next-intl falls back to English; add console warning in dev |
| Pluralization for "minutes" incorrect | Low | Low | Test with 1 minute and multiple minutes scenarios |
| Translation breaks button layout | Low | Low | Test in all languages; button uses flexbox for centering |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys to en.json | 5 min |
| Update GoogleOAuthButton.tsx | 10 min |
| Add translations to 5 other language files | 15 min |
| Testing and verification | 10 min |
| **Total** | **~40 min** |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request #326 in gen_requests_epic2.md](/docs/gen_requests_epic2.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- Component: `/src/components/GoogleOAuthButton.tsx`

---

## Related Requests

| Request ID | Title | Relationship |
|------------|-------|--------------|
| REQ-322 | Create Auth Namespace Structure in Translation File | Dependency (auth namespace must exist) |
| REQ-323 | Internationalize LoginPageContent Component | Same sub-epic (2A) |
| REQ-324 | Internationalize LoginForm Component | Same sub-epic (2A), uses same OAuth button |
| REQ-325 | Internationalize RegistrationForm Component | Same sub-epic (2A), uses same OAuth button |

---

*Document generated as part of L10N Epic 2 - Static UI Translation implementation.*
