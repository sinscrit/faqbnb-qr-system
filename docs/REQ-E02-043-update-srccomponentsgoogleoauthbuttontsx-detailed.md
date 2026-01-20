# Detailed Task Breakdown: REQ-E02-043 - Update GoogleOAuthButton Component for Internationalization

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-043
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.5
**Priority:** P1 - High
**Size:** S (Small)
**Status:** Ready for Implementation

---

## Document Purpose

This document provides granular, implementation-ready task specifications for updating the `GoogleOAuthButton` component to support internationalization (i18n) using the next-intl library. Each task is designed as a 1-story-point unit that can be executed independently with clear success criteria.

---

## Executive Summary

The GoogleOAuthButton component at `/src/components/GoogleOAuthButton.tsx` contains 5 hardcoded English strings that must be replaced with translation keys from the `auth` namespace. This includes:
- 1 button label
- 1 loading state text
- 1 aria-label attribute
- 1 rate limiting error message (with dynamic interpolation)
- 1 generic error fallback

**Total Implementation Tasks:** 9
**Estimated Total Effort:** S (30-45 minutes implementation + 15-30 minutes testing)

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete (next-intl installed and configured)
- [ ] `/messages/en.json` exists with `auth` namespace
- [ ] `/messages/en.json` exists with `errors` namespace
- [ ] `useTranslations` hook is available from next-intl
- [ ] REQ-E02-039 (auth namespace structure) is complete or in progress

---

## String Inventory

| # | String | Location | Line | Translation Key | Type | Notes |
|---|--------|----------|------|-----------------|------|-------|
| 1 | "Continue with Google" | Button text | 144 | `auth.google.button` | Static | Main CTA |
| 2 | "Connecting to Google..." | Loading state | 116 | `auth.google.loading` | Static | UX feedback |
| 3 | "Continue with Google" | aria-label | 111 | `auth.google.ariaLabel` | Accessibility | For screen readers |
| 4 | "Too many authentication attempts. Please try again in ${remainingTime} minutes." | Rate limit error | 42 | `auth.google.error.rateLimited` | Dynamic | Requires {minutes} interpolation |
| 5 | "An unexpected error occurred" | Error fallback | 91 | `errors.genericError` | Static | Use existing key |

---

## Detailed Task Specifications

### Task 1: Add Translation Hook Import

**Task ID:** E02-043-T1
**Type:** Code Change
**Effort:** XS (< 5 minutes)
**Dependencies:** None
**File:** `/src/components/GoogleOAuthButton.tsx`

#### Description
Add the `useTranslations` hook import from next-intl to the component's import section.

#### Current State (Line 3)
```typescript
import React, { useState } from 'react';
```

#### Target State
```typescript
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
```

#### Implementation Steps
1. Open `/src/components/GoogleOAuthButton.tsx`
2. Locate the import section (lines 1-3)
3. Add new import statement after React import (line 4)
4. Save file

#### Success Criteria
- [ ] `useTranslations` is imported from 'next-intl'
- [ ] No TypeScript compilation errors
- [ ] Import statement follows project conventions (single quotes, semicolons per project style)

#### Verification Command
```bash
grep -n "useTranslations" src/components/GoogleOAuthButton.tsx
```

---

### Task 2: Initialize Translation Hooks

**Task ID:** E02-043-T2
**Type:** Code Change
**Effort:** XS (< 5 minutes)
**Dependencies:** Task 1
**File:** `/src/components/GoogleOAuthButton.tsx`

#### Description
Initialize two translation hooks inside the component function: one for the `auth.google` namespace and one for the `errors` namespace.

#### Current State (Lines 26-33)
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

#### Target State
```typescript
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
```

#### Implementation Steps
1. Locate the component function declaration (line 20)
2. Find the first `useState` declaration (line 27)
3. Insert two hook calls before the useState declarations
4. Use `t` for `auth.google` namespace
5. Use `tErrors` for `errors` namespace
6. Save file

#### Success Criteria
- [ ] `t` hook initialized with `'auth.google'` namespace
- [ ] `tErrors` hook initialized with `'errors'` namespace
- [ ] Hooks are called at component level (not inside functions/conditionals)
- [ ] Hooks are placed before any state declarations
- [ ] No TypeScript compilation errors

#### Verification Command
```bash
grep -A 5 "function GoogleOAuthButton" src/components/GoogleOAuthButton.tsx | grep "useTranslations"
```

---

### Task 3: Replace Button Label Text

**Task ID:** E02-043-T3
**Type:** Code Change
**Effort:** XS (< 5 minutes)
**Dependencies:** Task 2
**File:** `/src/components/GoogleOAuthButton.tsx`

#### Description
Replace the hardcoded "Continue with Google" button text with the `t('button')` translation function call.

#### Current State (Line 144)
```tsx
<span>Continue with Google</span>
```

#### Target State
```tsx
<span>{t('button')}</span>
```

#### Implementation Steps
1. Locate line 144 (inside the non-loading state branch)
2. Replace the static string "Continue with Google" with `{t('button')}`
3. Ensure the JSX expression syntax is correct
4. Save file

#### Success Criteria
- [ ] Button text uses translation function `t('button')`
- [ ] JSX expression syntax is correct (`{t('button')}`)
- [ ] Component renders without errors
- [ ] No hardcoded "Continue with Google" in the button area

#### Verification Command
```bash
grep -n "t('button')" src/components/GoogleOAuthButton.tsx
```

---

### Task 4: Replace Loading State Text

**Task ID:** E02-043-T4
**Type:** Code Change
**Effort:** XS (< 5 minutes)
**Dependencies:** Task 2
**File:** `/src/components/GoogleOAuthButton.tsx`

#### Description
Replace the hardcoded "Connecting to Google..." loading text with the `t('loading')` translation function call.

#### Current State (Line 116)
```tsx
<span>Connecting to Google...</span>
```

#### Target State
```tsx
<span>{t('loading')}</span>
```

#### Implementation Steps
1. Locate line 116 (inside the loading state branch)
2. Replace the static string "Connecting to Google..." with `{t('loading')}`
3. Ensure the JSX expression syntax is correct
4. Save file

#### Success Criteria
- [ ] Loading text uses translation function `t('loading')`
- [ ] JSX expression syntax is correct
- [ ] Component renders without errors during loading state

#### Verification Command
```bash
grep -n "t('loading')" src/components/GoogleOAuthButton.tsx
```

---

### Task 5: Replace Aria-Label Attribute

**Task ID:** E02-043-T5
**Type:** Code Change
**Effort:** XS (< 5 minutes)
**Dependencies:** Task 2
**File:** `/src/components/GoogleOAuthButton.tsx`

#### Description
Replace the hardcoded `aria-label="Continue with Google"` attribute with a translated value using `t('ariaLabel')`.

#### Current State (Line 111)
```tsx
aria-label="Continue with Google"
```

#### Target State
```tsx
aria-label={t('ariaLabel')}
```

#### Implementation Steps
1. Locate line 111 (button's aria-label attribute)
2. Replace the static string value with `{t('ariaLabel')}`
3. Ensure the attribute assignment uses curly braces for JSX expression
4. Save file

#### Success Criteria
- [ ] `aria-label` uses translation function `t('ariaLabel')`
- [ ] Attribute syntax is correct (`aria-label={t('ariaLabel')}`)
- [ ] Button remains accessible to screen readers
- [ ] No hardcoded aria-label string

#### Verification Command
```bash
grep -n "aria-label={t" src/components/GoogleOAuthButton.tsx
```

---

### Task 6: Replace Rate Limiting Error Message

**Task ID:** E02-043-T6
**Type:** Code Change
**Effort:** S (5-10 minutes)
**Dependencies:** Task 2
**File:** `/src/components/GoogleOAuthButton.tsx`

#### Description
Replace the hardcoded rate limiting error message with a translated message using ICU interpolation for the dynamic `remainingTime` value.

#### Current State (Lines 41-42)
```typescript
const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
onAuthError?.(`Too many authentication attempts. Please try again in ${remainingTime} minutes.`);
```

#### Target State
```typescript
const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
onAuthError?.(t('error.rateLimited', { minutes: remainingTime }));
```

#### Implementation Steps
1. Locate line 42 (inside `handleOAuthSignIn` function, rate limit branch)
2. Replace the template literal with `t('error.rateLimited', { minutes: remainingTime })`
3. Ensure the interpolation parameter is named `minutes` (matching the translation key)
4. Save file

#### Success Criteria
- [ ] Rate limit error uses `t('error.rateLimited', { minutes: remainingTime })`
- [ ] Interpolation parameter is named `minutes`
- [ ] The `remainingTime` calculation remains unchanged
- [ ] Error callback receives translated string

#### Technical Notes
- The translation key will use ICU plural format: `"Too many authentication attempts. Please try again in {minutes, plural, one {# minute} other {# minutes}}."`
- This handles proper pluralization across languages

#### Verification Command
```bash
grep -n "error.rateLimited" src/components/GoogleOAuthButton.tsx
```

---

### Task 7: Replace Generic Error Fallback

**Task ID:** E02-043-T7
**Type:** Code Change
**Effort:** XS (< 5 minutes)
**Dependencies:** Task 2
**File:** `/src/components/GoogleOAuthButton.tsx`

#### Description
Replace the hardcoded generic error fallback message with a translation from the `errors` namespace.

#### Current State (Line 91)
```typescript
const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
```

#### Target State
```typescript
const errorMessage = error instanceof Error ? error.message : tErrors('genericError');
```

#### Implementation Steps
1. Locate line 91 (inside the catch block of `handleOAuthSignIn`)
2. Replace `'An unexpected error occurred'` with `tErrors('genericError')`
3. Ensure the `tErrors` hook is used (not `t`)
4. Save file

#### Success Criteria
- [ ] Generic error uses `tErrors('genericError')`
- [ ] The `errors` namespace hook is used correctly
- [ ] Error handling logic remains unchanged
- [ ] Fallback only applies when error is not an Error instance

#### Note
The `errors.genericError` key already exists in `/messages/en.json` with value "Something went wrong. Please try again."

#### Verification Command
```bash
grep -n "tErrors('genericError')" src/components/GoogleOAuthButton.tsx
```

---

### Task 8: Add Translation Keys to English Locale

**Task ID:** E02-043-T8
**Type:** Translation File Update
**Effort:** S (5-10 minutes)
**Dependencies:** None (can be done in parallel with code changes)
**File:** `/messages/en.json`

#### Description
Add the new translation keys under the `auth.google` namespace in the English translation file.

#### Current State
```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    ...
    "continueWithGoogle": "Continue with Google",
    ...
  }
}
```

#### Target State
```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    ...
    "continueWithGoogle": "Continue with Google",
    "google": {
      "button": "Continue with Google",
      "loading": "Connecting to Google...",
      "ariaLabel": "Continue with Google",
      "error": {
        "rateLimited": "Too many authentication attempts. Please try again in {minutes, plural, one {# minute} other {# minutes}}."
      }
    },
    ...
  }
}
```

#### Implementation Steps
1. Open `/messages/en.json`
2. Locate the `auth` namespace
3. Add new `google` nested object after existing auth keys
4. Add `button`, `loading`, `ariaLabel` as direct children of `google`
5. Add `error` object with `rateLimited` key using ICU plural format
6. Ensure valid JSON syntax (commas, quotes, braces)
7. Save file

#### New Translation Keys

| Key | Value | Type |
|-----|-------|------|
| `auth.google.button` | "Continue with Google" | Static |
| `auth.google.loading` | "Connecting to Google..." | Static |
| `auth.google.ariaLabel` | "Continue with Google" | Static |
| `auth.google.error.rateLimited` | "Too many authentication attempts. Please try again in {minutes, plural, one {# minute} other {# minutes}}." | ICU Plural |

#### Success Criteria
- [ ] All 4 keys added under `auth.google` namespace
- [ ] JSON file is valid (no syntax errors)
- [ ] ICU plural format is correct for rateLimited message
- [ ] Existing translations remain unchanged

#### Verification Command
```bash
cat messages/en.json | jq '.auth.google'
```

---

### Task 9: Verification and Testing

**Task ID:** E02-043-T9
**Type:** Testing
**Effort:** S (10-15 minutes)
**Dependencies:** Tasks 1-8
**Files:** Multiple

#### Description
Verify the component works correctly with translations and test in multiple scenarios.

#### Test Scenarios

##### 9.1 Basic Render Test
1. Navigate to login page (`/login`)
2. Verify "Continue with Google" button displays
3. Verify button text is from translation (not hardcoded)

##### 9.2 Loading State Test
1. Click the Google OAuth button
2. Verify "Connecting to Google..." appears briefly before redirect
3. Note: Redirect happens quickly, may need to add console.log to verify

##### 9.3 Aria-Label Accessibility Test
1. Use browser DevTools to inspect the button element
2. Verify `aria-label` attribute has the translated value
3. Test with screen reader if available

##### 9.4 Rate Limiting Test (Manual)
1. Temporarily modify `MAX_ATTEMPTS` to 1 for testing
2. Click button multiple times
3. Verify rate limit error message appears
4. Verify pluralization works (1 minute vs 2 minutes)
5. Reset `MAX_ATTEMPTS` to 3 after testing

##### 9.5 TypeScript Build Test
```bash
npm run build
```
Verify no TypeScript compilation errors.

##### 9.6 Translation Key Verification
```bash
# Verify all keys exist in en.json
grep -r "auth.google" messages/en.json

# Verify component uses translation hooks
grep -n "useTranslations\|t('\|tErrors(" src/components/GoogleOAuthButton.tsx
```

#### Success Criteria
- [ ] Component renders without errors
- [ ] Button displays translated text
- [ ] Loading state displays translated text
- [ ] Aria-label is properly translated
- [ ] Rate limit error shows with correct pluralization
- [ ] Generic error fallback works
- [ ] TypeScript build passes
- [ ] No console errors related to missing translations

---

## Implementation Checklist

### Code Changes
- [ ] T1: Import `useTranslations` hook
- [ ] T2: Initialize `t` and `tErrors` hooks
- [ ] T3: Replace button label text
- [ ] T4: Replace loading state text
- [ ] T5: Replace aria-label attribute
- [ ] T6: Replace rate limit error message with interpolation
- [ ] T7: Replace generic error fallback

### Translation Files
- [ ] T8: Add `auth.google.button` key
- [ ] T8: Add `auth.google.loading` key
- [ ] T8: Add `auth.google.ariaLabel` key
- [ ] T8: Add `auth.google.error.rateLimited` key with ICU plural format

### Testing
- [ ] T9: Basic render verification
- [ ] T9: Loading state verification
- [ ] T9: Accessibility verification
- [ ] T9: Rate limiting message verification
- [ ] T9: Build verification

---

## Complete Code Transformation

### Before (Current Implementation)

```typescript
'use client';

import React, { useState } from 'react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
  const MAX_ATTEMPTS = 3;

  const handleOAuthSignIn = async () => {
    if (disabled || isLoading) return;

    const now = Date.now();
    if (now - lastAttempt < RATE_LIMIT_WINDOW && attemptCount >= MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
      onAuthError?.(`Too many authentication attempts. Please try again in ${remainingTime} minutes.`);
      return;
    }

    // ... rest of function ...

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      onAuthError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleOAuthSignIn}
      disabled={disabled || isLoading}
      className="..."
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
  const tErrors = useTranslations('errors');

  const [isLoading, setIsLoading] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
  const MAX_ATTEMPTS = 3;

  const handleOAuthSignIn = async () => {
    if (disabled || isLoading) return;

    const now = Date.now();
    if (now - lastAttempt < RATE_LIMIT_WINDOW && attemptCount >= MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastAttempt)) / 1000 / 60);
      onAuthError?.(t('error.rateLimited', { minutes: remainingTime }));
      return;
    }

    // ... rest of function ...

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : tErrors('genericError');
      onAuthError?.(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleOAuthSignIn}
      disabled={disabled || isLoading}
      className="..."
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

## Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| `/src/components/GoogleOAuthButton.tsx` | Component | Add import, hooks, replace 5 strings |
| `/messages/en.json` | Translation | Add 4 new keys under `auth.google` |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Task(s) | Status |
|---------------------|---------|--------|
| Button label "Continue with Google" uses translation key | T3, T8 | [ ] |
| Loading state text uses translation key | T4, T8 | [ ] |
| Aria-label attribute references translation key | T5, T8 | [ ] |
| Rate limiting error with interpolation is localized | T6, T8 | [ ] |
| Generic error fallback uses translation key | T7 | [ ] |
| Component imports appropriate translation hook | T1 | [ ] |
| Translation keys follow auth.google.* namespace | T8 | [ ] |
| All strings added to /messages/en.json | T8 | [ ] |
| Error message interpolation formats correctly | T6, T9 | [ ] |
| Button remains fully functional | T9 | [ ] |
| Focus management and ARIA attributes intact | T5, T9 | [ ] |
| Visual appearance unchanged | T9 | [ ] |
| Screen reader announces in selected language | T5, T9 | [ ] |
| Semantic key naming | T8 | [ ] |

---

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Missing translation causes runtime error | Medium | Low | next-intl shows key name as fallback |
| ICU plural syntax incorrect | Low | Medium | Test with values 0, 1, 2, 5 |
| Hooks called conditionally causing React error | High | Low | Place hooks at top of component |
| Redirect happens before translation renders | Low | Medium | Translation loads before user interaction |
| Build fails due to TypeScript errors | Medium | Low | Run `npm run build` before committing |

---

## Dependencies

### Blocking
- Epic 1 Foundation must be complete (next-intl configured)
- REQ-E02-039: `auth` namespace structure must exist

### Non-Blocking
- REQ-E02-032: `errors` namespace (can use existing `genericError` key)
- Translation generation tasks for non-English languages (separate tasks)

---

## References

- [Overview Document](/docs/REQ-E02-043-update-srccomponentsgoogleoauthbuttontsx-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Requirements Document](/docs/gen_requests_epic2.md) - REQ-E02-043
- [Component File](/src/components/GoogleOAuthButton.tsx)
- [English Translation File](/messages/en.json)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A: Authentication & Registration*
*Task ID: 2A.5 - Update GoogleOAuthButton Component*
