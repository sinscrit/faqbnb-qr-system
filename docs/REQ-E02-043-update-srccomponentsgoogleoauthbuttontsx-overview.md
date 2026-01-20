# Implementation Breakdown: REQ-E02-043 - Update GoogleOAuthButton Component for Internationalization

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-043
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.5
**Priority:** P1 - High
**Size:** S (Small)

---

## Overview

This document provides a detailed implementation breakdown for updating the `GoogleOAuthButton` component to support internationalization (i18n) using the next-intl library. All hardcoded English strings in the component must be replaced with translation keys from the `auth` namespace to enable multi-language Google OAuth button support across all 6 supported languages (English, French, Spanish, German, Dutch, Italian).

---

## Request Summary

### Current Behavior
The `GoogleOAuthButton` component located at `/src/components/GoogleOAuthButton.tsx` contains approximately 10 hardcoded English strings for:
- Button label ("Continue with Google")
- Loading state text ("Connecting to Google...")
- Aria-label attribute ("Continue with Google")
- Rate limiting error message with dynamic time interpolation
- Generic error fallback message

Users see OAuth-related text only in English regardless of their language preference.

### Expected Behavior
The `GoogleOAuthButton` component displays all user-facing text in the user's selected language by retrieving values from the `auth` namespace translation files. Button labels, loading states, accessibility attributes, and error messages adapt to the active language setting, with proper interpolation for dynamic values like remaining wait time in rate limiting messages.

---

## Technical Context

### Existing Patterns
The codebase already has established patterns for internationalization:

1. **Translation Hook Usage** (from `LogoutButton.tsx`):
   ```typescript
   import { useTranslations } from 'next-intl';

   const t = useTranslations('auth');
   const tCommon = useTranslations('common');
   ```

2. **Translation File Structure** (`/messages/en.json`):
   - `auth` namespace exists with basic authentication strings including `continueWithGoogle`
   - `common` namespace exists for shared UI strings
   - `errors` namespace exists for error messages

3. **Component Pattern**:
   - Client components use `'use client'` directive
   - Translation hooks are called at the component level
   - Multiple namespace hooks can be used simultaneously

4. **ICU Interpolation Pattern** (from implementation plan):
   ```typescript
   t('message', { count: itemCount })
   ```

### Existing Translation Key
The `auth.continueWithGoogle` key already exists in `/messages/en.json`:
```json
{
  "auth": {
    "continueWithGoogle": "Continue with Google"
  }
}
```

### Dependencies
- **Epic 1 Foundation**: next-intl setup is complete
- **Translation Files**: `/messages/en.json` with `auth` namespace established
- **REQ-E02-039**: `auth` namespace structure (provides foundation)

---

## String Inventory

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Continue with Google" | Line 144 | `auth.google.button` | Static |
| "Connecting to Google..." | Line 116 | `auth.google.loading` | Static |
| "Continue with Google" | Line 112 (aria-label) | `auth.google.ariaLabel` | Accessibility |
| "Too many authentication attempts. Please try again in {remainingTime} minutes." | Line 42 | `auth.google.error.rateLimited` | Dynamic (interpolation) |
| "An unexpected error occurred" | Line 91 | `errors.genericError` | Static (use existing) |

---

## Implementation Tasks

### Task 1: Import Translation Hook
**Effort:** XS
**Description:** Add the `useTranslations` import from next-intl to the component.

**Changes:**
```typescript
// Add to existing imports
import { useTranslations } from 'next-intl';
```

---

### Task 2: Initialize Translation Hooks
**Effort:** XS
**Description:** Initialize translation hooks for `auth` and `errors` namespaces at the component level, inside the component function before state declarations.

**Changes:**
```typescript
// Add after component declaration, before state declarations (after line 27)
const t = useTranslations('auth.google');
const tErrors = useTranslations('errors');
```

---

### Task 3: Replace Button Label Text
**Effort:** XS
**Description:** Replace the hardcoded "Continue with Google" button text with a translation key.

**Current Code (Line 144):**
```typescript
<span>Continue with Google</span>
```

**Updated Code:**
```typescript
<span>{t('button')}</span>
```

**Translation Key to Add:**
- `auth.google.button`: "Continue with Google"

---

### Task 4: Replace Loading State Text
**Effort:** XS
**Description:** Replace the hardcoded loading text with a translation key.

**Current Code (Line 116):**
```typescript
<span>Connecting to Google...</span>
```

**Updated Code:**
```typescript
<span>{t('loading')}</span>
```

**Translation Key to Add:**
- `auth.google.loading`: "Connecting to Google..."

---

### Task 5: Replace Aria-Label Attribute
**Effort:** XS
**Description:** Replace the hardcoded aria-label with a translation key for accessibility.

**Current Code (Line 112):**
```typescript
aria-label="Continue with Google"
```

**Updated Code:**
```typescript
aria-label={t('ariaLabel')}
```

**Translation Key to Add:**
- `auth.google.ariaLabel`: "Continue with Google"

---

### Task 6: Replace Rate Limiting Error Message
**Effort:** S
**Description:** Replace the hardcoded rate limiting error message with a translation key that uses ICU interpolation for the dynamic remaining time value.

**Current Code (Lines 41-42):**
```typescript
onAuthError?.(`Too many authentication attempts. Please try again in ${remainingTime} minutes.`);
```

**Updated Code:**
```typescript
onAuthError?.(t('error.rateLimited', { minutes: remainingTime }));
```

**Translation Key to Add (with ICU format):**
- `auth.google.error.rateLimited`: "Too many authentication attempts. Please try again in {minutes, plural, one {# minute} other {# minutes}}."

---

### Task 7: Replace Generic Error Message
**Effort:** XS
**Description:** Replace the hardcoded generic error fallback with a translation key from the existing errors namespace.

**Current Code (Line 91):**
```typescript
const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
```

**Updated Code:**
```typescript
const errorMessage = error instanceof Error ? error.message : tErrors('genericError');
```

**Note:** The `errors.genericError` key already exists in `/messages/en.json`.

---

### Task 8: Update Translation Files
**Effort:** S
**Description:** Add all new translation keys to `/messages/en.json` under the `auth.google` namespace.

**New Keys Structure:**
```json
{
  "auth": {
    "google": {
      "button": "Continue with Google",
      "loading": "Connecting to Google...",
      "ariaLabel": "Continue with Google",
      "error": {
        "rateLimited": "Too many authentication attempts. Please try again in {minutes, plural, one {# minute} other {# minutes}}."
      }
    }
  }
}
```

---

### Task 9: Verification Testing
**Effort:** S
**Description:** Verify the component renders correctly in all supported languages.

**Test Cases:**
1. Load the login/registration page in each of the 6 supported languages
2. Verify the button label displays correctly in selected language
3. Trigger loading state and verify loading text is translated
4. Verify aria-label is set correctly via accessibility tools
5. Trigger rate limiting (manually or via test) and verify error message is translated with correct pluralization
6. Verify error fallback message displays correctly

---

## Authorized Files and Functions for Modification

### Primary Component File
| File | Purpose | Modifications Allowed |
|------|---------|----------------------|
| `/src/components/GoogleOAuthButton.tsx` | Google OAuth button component | Add imports, modify all hardcoded strings to use translation hooks |

### Translation Files
| File | Purpose | Modifications Allowed |
|------|---------|----------------------|
| `/messages/en.json` | English translations | Add new keys under `auth.google` namespace |
| `/messages/fr.json` | French translations | Add translations (handled by separate task) |
| `/messages/es.json` | Spanish translations | Add translations (handled by separate task) |
| `/messages/de.json` | German translations | Add translations (handled by separate task) |
| `/messages/nl.json` | Dutch translations | Add translations (handled by separate task) |
| `/messages/it.json` | Italian translations | Add translations (handled by separate task) |

### Functions to Modify

| Function | Line Numbers | Modification |
|----------|--------------|--------------|
| `GoogleOAuthButton` (component) | 20-149 | Add translation hooks, replace hardcoded strings |
| `handleOAuthSignIn` | 35-94 | Use translated error messages for rate limiting and generic errors |

---

## Code Transformation Reference

### Before (Current Implementation)
```typescript
'use client';

import React, { useState } from 'react';

// ... interface definition ...

export default function GoogleOAuthButton({
  accessCode,
  email,
  onAuthStart,
  onAuthError,
  disabled = false
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
  const MAX_ATTEMPTS = 3;

  const handleOAuthSignIn = async () => {
    // ... rate limiting check ...
    const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
    onAuthError?.(`Too many authentication attempts. Please try again in ${remainingTime} minutes.`);
    // ...
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    // ...
  };

  return (
    <button
      aria-label="Continue with Google"
    >
      {isLoading ? (
        <>
          <div className="animate-spin..."></div>
          <span>Connecting to Google...</span>
        </>
      ) : (
        <>
          {/* Google Logo SVG */}
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}
```

### After (Internationalized Implementation)
```typescript
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

// ... interface definition ...

export default function GoogleOAuthButton({
  accessCode,
  email,
  onAuthStart,
  onAuthError,
  disabled = false
}: GoogleOAuthButtonProps) {
  const t = useTranslations('auth.google');
  const tErrors = useTranslations('errors');

  const [isLoading, setIsLoading] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
  const MAX_ATTEMPTS = 3;

  const handleOAuthSignIn = async () => {
    // ... rate limiting check ...
    const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
    onAuthError?.(t('error.rateLimited', { minutes: remainingTime }));
    // ...
    const errorMessage = error instanceof Error ? error.message : tErrors('genericError');
    // ...
  };

  return (
    <button
      aria-label={t('ariaLabel')}
    >
      {isLoading ? (
        <>
          <div className="animate-spin..."></div>
          <span>{t('loading')}</span>
        </>
      ) : (
        <>
          {/* Google Logo SVG */}
          <span>{t('button')}</span>
        </>
      )}
    </button>
  );
}
```

---

## Implementation Checklist

- [ ] Import `useTranslations` hook from next-intl
- [ ] Initialize `t` hook for `auth.google` namespace
- [ ] Initialize `tErrors` hook for `errors` namespace
- [ ] Replace "Continue with Google" button text
- [ ] Replace "Connecting to Google..." loading text
- [ ] Replace aria-label attribute value
- [ ] Replace rate limiting error message with interpolation
- [ ] Replace generic error fallback message
- [ ] Add new keys to `/messages/en.json` under `auth.google` namespace
- [ ] Verify button displays correctly in all 6 supported languages
- [ ] Verify loading state displays correctly
- [ ] Verify accessibility attribute works correctly
- [ ] Verify rate limiting error shows correct pluralization

---

## Dependencies

### Blocking Dependencies
- REQ-E02-039: `auth` namespace structure must exist in translation files

### Non-Blocking Dependencies
- REQ-E02-032: `errors` namespace structure (can use existing `genericError` key)
- Translation generation tasks for non-English languages (handled separately)

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Error callbacks may expect specific string format | Low | Error messages are passed to callbacks, not parsed - translation is transparent |
| Pluralization complexity in rate limit message | Low | Use ICU plural format supported by next-intl |
| Aria-label translation affects accessibility | Low | Test with screen readers in multiple languages |
| Component already redirects on click, may not fully render translations | Low | Hook is called before redirect, will render on initial load |

---

## Acceptance Criteria

From REQ-E02-043:
- [ ] Button label "Continue with Google" uses translation key from auth namespace
- [ ] Loading state text "Connecting to Google..." uses translation key
- [ ] Aria-label attribute references a translation key for accessibility
- [ ] Rate limiting error message with dynamic time value is properly localized using translation with interpolation
- [ ] Generic error message fallback uses translation key
- [ ] Component imports and uses the appropriate translation hook (useTranslations from next-intl)
- [ ] Translation keys follow the established auth.google.* namespace structure
- [ ] All extracted strings are added to English base translation file at /messages/en.json
- [ ] Error message interpolation correctly formats the remaining minutes value across different languages

---

## Effort Estimate

| Task | Effort |
|------|--------|
| Import and initialize hooks | XS |
| Replace static strings (4) | S |
| Replace dynamic error message | S |
| Update translation files | S |
| Testing | S |
| **Total** | **S (Small)** |

Estimated time: 30-45 minutes for implementation, 15-30 minutes for testing.

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-043
- [Pattern Reference: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [Pattern Reference: LoginForm.tsx Overview](/docs/REQ-E02-041-update-srccomponentsloginformtsx-overview.md)
- [Translation File: en.json](/messages/en.json)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A: Authentication & Registration*
