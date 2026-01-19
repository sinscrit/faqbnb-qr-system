# REQ-358: Update GoogleOAuthButton.tsx for Internationalization

**Created:** 2026-01-19 18:30 UTC
**Last Modified:** 2026-01-19 18:30 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.5
**Request Type:** ENHANCEMENT
**Size:** S (Small)
**Priority:** P1 - High

---

## Overview

This document provides the implementation breakdown for internationalizing the `GoogleOAuthButton.tsx` component. This is Task 2A.5 in the L10N Epic 2 implementation plan, which focuses on replacing all hardcoded English text strings with translation keys from the `auth` namespace using the next-intl framework.

The GoogleOAuthButton component is a client-side authentication component used for Google OAuth sign-in flows. It contains approximately 4-5 user-facing strings including button labels, loading states, rate limiting error messages, and accessibility attributes that need to be extracted and translated.

---

## Current State Analysis

### Component Location
`/src/components/GoogleOAuthButton.tsx`

### Component Type
- **Client Component** (`'use client'` directive)
- Uses `useTranslations` hook from `next-intl` (not `getTranslations`)

### Existing Dependencies
```typescript
import React, { useState } from 'react';
```

### Component Props Interface
```typescript
interface GoogleOAuthButtonProps {
  accessCode?: string;
  email?: string;
  onAuthStart?: () => void;
  onAuthError?: (error: string) => void;
  disabled?: boolean;
}
```

### Hardcoded Strings Inventory

| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 42 | `'Too many authentication attempts. Please try again in ${remainingTime} minutes.'` | `auth.google.error.rateLimited` | Dynamic time interpolation needed |
| 91 | `'An unexpected error occurred'` | `auth.google.error.unexpected` | Generic error fallback |
| 112 | `aria-label="Continue with Google"` | `auth.google.ariaLabel` | Accessibility attribute |
| 116 | `'Connecting to Google...'` | `auth.google.connecting` | Loading state |
| 144 | `'Continue with Google'` | `auth.google.button` | Primary button label |

---

## Implementation Approach

### Pattern Reference
Follow the established pattern from `LogoutButton.tsx` and `LoginForm.tsx`:
```typescript
import { useTranslations } from 'next-intl';

function GoogleOAuthButton({ ... }: GoogleOAuthButtonProps) {
  const t = useTranslations('auth.google');

  return <button aria-label={t('ariaLabel')}>{t('button')}</button>;
}
```

### Translation Namespace Structure
The `auth.google` namespace in `/messages/en.json` needs to be added with the following structure:

```json
{
  "auth": {
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

### Translation Key Convention
Following the established Epic 2 naming convention:
```
{namespace}.{component/area}.{element}.{variant?}
```

For this component:
- `auth.google.button` - Primary button text
- `auth.google.connecting` - Loading state text
- `auth.google.ariaLabel` - Accessibility label
- `auth.google.error.rateLimited` - Rate limit error message
- `auth.google.error.unexpected` - Generic error message

---

## Authorized Files and Functions for Modification

### Primary File
| File Path | Modification Scope |
|-----------|-------------------|
| `/src/components/GoogleOAuthButton.tsx` | Add import, replace all hardcoded strings with `t()` calls |

### Translation Files
| File Path | Modification Scope |
|-----------|-------------------|
| `/messages/en.json` | Add `auth.google` namespace entries |
| `/messages/fr.json` | Add French translations for `auth.google` |
| `/messages/es.json` | Add Spanish translations for `auth.google` |
| `/messages/de.json` | Add German translations for `auth.google` |
| `/messages/nl.json` | Add Dutch translations for `auth.google` |
| `/messages/it.json` | Add Italian translations for `auth.google` |

### Functions to Modify
| Function/Component | Location | Changes |
|-------------------|----------|---------|
| `GoogleOAuthButton` | Lines 20-149 | Add `useTranslations` hook, replace strings |
| `handleOAuthSignIn` | Lines 35-94 | Replace hardcoded error messages |
| JSX render | Lines 97-148 | Replace button text, aria-label, loading state |

---

## Implementation Tasks

### Task 1: Update Translation Files
**Estimate:** Small
**Description:** Add the required translation keys to all 6 language files.

**Steps:**
1. Open `/messages/en.json`
2. Add the `auth.google` namespace
3. Use ICU format for plural variables: `{minutes, plural, one {minute} other {minutes}}`
4. Copy structure to other language files and translate

**English Translation Keys:**
```json
{
  "auth": {
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

**French Translation:**
```json
{
  "auth": {
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

**Spanish Translation:**
```json
{
  "auth": {
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

**German Translation:**
```json
{
  "auth": {
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

**Dutch Translation:**
```json
{
  "auth": {
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

**Italian Translation:**
```json
{
  "auth": {
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

### Task 2: Add useTranslations Import
**Estimate:** Trivial
**Description:** Add the next-intl import to GoogleOAuthButton.tsx.

**Code Change:**
```typescript
// Add to existing imports (after line 1)
import { useTranslations } from 'next-intl';
```

### Task 3: Initialize Translation Hook
**Estimate:** Trivial
**Description:** Add translation hook initialization inside the component.

**Code Change (after line 27, inside the component function):**
```typescript
const t = useTranslations('auth.google');
```

### Task 4: Update Rate Limit Error Message
**Estimate:** Small
**Description:** Replace hardcoded rate limit error message with translated version using ICU plural format.

**Location:** Lines 40-43

**Before:**
```typescript
const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
onAuthError?.(`Too many authentication attempts. Please try again in ${remainingTime} minutes.`);
return;
```

**After:**
```typescript
const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
onAuthError?.(t('error.rateLimited', { minutes: remainingTime }));
return;
```

### Task 5: Update Generic Error Message
**Estimate:** Trivial
**Description:** Replace hardcoded generic error message.

**Location:** Line 91

**Before:**
```typescript
const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
```

**After:**
```typescript
const errorMessage = error instanceof Error ? error.message : t('error.unexpected');
```

### Task 6: Update aria-label Attribute
**Estimate:** Trivial
**Description:** Replace hardcoded aria-label with translated version.

**Location:** Line 112

**Before:**
```typescript
aria-label="Continue with Google"
```

**After:**
```typescript
aria-label={t('ariaLabel')}
```

### Task 7: Update Loading State Text
**Estimate:** Trivial
**Description:** Replace loading state text with translated version.

**Location:** Lines 113-117

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

### Task 8: Update Button Label Text
**Estimate:** Trivial
**Description:** Replace primary button label with translated version.

**Location:** Line 144

**Before:**
```tsx
<span>Continue with Google</span>
```

**After:**
```tsx
<span>{t('button')}</span>
```

---

## Dependencies

### Required Before Implementation
- [x] Epic 1 Foundation complete (next-intl installed, IntlProvider configured)
- [ ] Task 2A.1: Create `auth` namespace structure (should be complete or done in parallel)

### Components This Affects
- None - GoogleOAuthButton is a leaf component

### Components That Depend on This
- `/src/components/LoginForm.tsx` - Uses GoogleOAuthButton for OAuth sign-in
- `/src/components/RegistrationForm.tsx` - Uses GoogleOAuthButton for OAuth registration

---

## Testing Requirements

### Manual Testing Checklist
- [ ] Button renders without errors in English (default)
- [ ] Button label "Continue with Google" displays correctly in each of the 6 languages
- [ ] Loading state "Connecting to Google..." displays correctly in all languages
- [ ] Rate limiting error message displays correctly with proper minute pluralization
- [ ] Test rate limit with 1 minute remaining (singular form)
- [ ] Test rate limit with multiple minutes remaining (plural form)
- [ ] Generic error message displays correctly when unexpected errors occur
- [ ] aria-label is properly translated and accessible to screen readers
- [ ] No console errors related to missing translations
- [ ] OAuth flow initiates correctly and redirects properly
- [ ] Button styling and layout remain unchanged
- [ ] Button disabled state works correctly
- [ ] onAuthStart callback fires at correct time
- [ ] onAuthError callback receives translated error messages

### Accessibility Verification
- [ ] Screen reader announces translated button label
- [ ] Screen reader announces translated loading state
- [ ] Tab focus works correctly on button
- [ ] Button states (normal, loading, disabled) are all accessible

### Language-Specific Testing
Test in each supported language:
- [ ] English (en) - Default
- [ ] French (fr)
- [ ] Spanish (es)
- [ ] German (de) - Verify longer text fits
- [ ] Dutch (nl)
- [ ] Italian (it)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys | Low | Medium | Build-time check with next-intl |
| ICU plural format error | Low | Medium | Test both singular and plural forms |
| Button text truncation | Low | Low | Text is short, German ~20% longer |
| OAuth flow regression | Low | High | Test complete OAuth flow thoroughly |
| aria-label accessibility issues | Low | Medium | Test with screen reader |
| Error callback changes | Low | Medium | Parent components may expect English errors |

---

## Acceptance Criteria Verification

| Criterion | Implementation Task |
|-----------|---------------------|
| Button label text "Continue with Google" uses a translation key | Task 8 |
| Loading state text "Connecting to Google..." uses a translation key | Task 7 |
| Rate limiting error message is extracted with dynamic minute interpolation | Task 4 |
| Rate limiting error message formats time according to locale (pluralization) | Task 4 |
| Generic error message uses a translation key | Task 5 |
| The aria-label attribute value is derived from a translation key | Task 6 |
| Component imports and correctly uses useTranslations from next-intl | Task 2, Task 3 |
| All OAuth flows continue to function correctly | Testing Requirements |
| Button maintains existing styling, layout, and visual presentation | No CSS changes |
| Error callbacks receive properly formatted localized error messages | Task 4, Task 5 |
| Translation keys follow established auth namespace structure | Task 1 |
| Component remains accessible with properly localized announcements | Task 6, Testing |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-358)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [Existing Pattern: LoginForm.tsx](/src/components/LoginForm.tsx)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [Related Task: REQ-356 LoginForm](/docs/REQ-356-update-srccomponentsloginformtsx-overview.md)

---

## Appendix: Complete String Extraction Map

```
GoogleOAuthButton.tsx String Extraction

+---------------------------------------------------------------+
| RATE LIMIT ERROR (lines 40-43)                                 |
+---------------------------------------------------------------+
| "Too many authentication attempts..."                          |
|     -> t('error.rateLimited', { minutes: remainingTime })      |
+---------------------------------------------------------------+

+---------------------------------------------------------------+
| GENERIC ERROR (line 91)                                        |
+---------------------------------------------------------------+
| "An unexpected error occurred"                                 |
|     -> t('error.unexpected')                                   |
+---------------------------------------------------------------+

+---------------------------------------------------------------+
| ARIA LABEL (line 112)                                          |
+---------------------------------------------------------------+
| aria-label="Continue with Google"                              |
|     -> aria-label={t('ariaLabel')}                            |
+---------------------------------------------------------------+

+---------------------------------------------------------------+
| LOADING STATE (line 116)                                       |
+---------------------------------------------------------------+
| "Connecting to Google..."                                      |
|     -> t('connecting')                                         |
+---------------------------------------------------------------+

+---------------------------------------------------------------+
| BUTTON LABEL (line 144)                                        |
+---------------------------------------------------------------+
| "Continue with Google"                                         |
|     -> t('button')                                             |
+---------------------------------------------------------------+
```

---

## Appendix: Complete Modified Component

After implementation, the component should look like:

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

    // ... rest of handleOAuthSignIn unchanged ...

    } catch (error) {
      // ...
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
      className={/* ... unchanged ... */}
      aria-label={t('ariaLabel')}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
          <span>{t('connecting')}</span>
        </>
      ) : (
        <>
          {/* Google Logo SVG - unchanged */}
          <span>{t('button')}</span>
        </>
      )}
    </button>
  );
}
```

---

*Document generated for FAQBNB L10N Epic 2 - Task 2A.5*
