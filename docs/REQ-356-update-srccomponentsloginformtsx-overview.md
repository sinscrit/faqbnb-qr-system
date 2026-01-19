# REQ-356: Update LoginForm.tsx for Internationalization

**Created:** 2026-01-19 14:30 UTC
**Last Modified:** 2026-01-19 14:30 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.3
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High

---

## Overview

This document provides the implementation breakdown for internationalizing the `LoginForm.tsx` component. This is Task 2A.3 in the L10N Epic 2 implementation plan, which focuses on replacing all hardcoded English text strings with translation keys from the `auth` namespace using the next-intl framework.

The LoginForm component is a core authentication component containing approximately 25-30 user-facing strings including form labels, placeholders, validation messages, button text, and error messages that need to be extracted and translated.

---

## Current State Analysis

### Component Location
`/src/components/LoginForm.tsx`

### Component Type
- **Client Component** (`'use client'` directive)
- Uses `useTranslations` hook from `next-intl` (not `getTranslations`)

### Existing Dependencies
```typescript
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import GoogleOAuthButton from './GoogleOAuthButton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
```

### Hardcoded Strings Inventory

| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 51 | `'Email is required'` | `auth.login.form.validation.emailRequired` | Validation error |
| 53 | `'Please enter a valid email address'` | `auth.login.form.validation.invalidEmail` | Validation error |
| 57 | `'Password is required'` | `auth.login.form.validation.passwordRequired` | Validation error |
| 58 | `'Password must be at least 6 characters'` | `auth.login.form.validation.passwordMinLength` | Validation error |
| 138 | `'Invalid email or password. Please check your credentials and try again.'` | `auth.login.error.invalidCredentials` | Auth error |
| 141 | `'Access denied. Admin privileges are required.'` | `auth.login.error.accessDenied` | Auth error |
| 161 | `'Login failed: No user returned'` | `auth.login.error.noUserReturned` | Auth error |
| 196 | `'Authentication Failed'` | `auth.login.error.title` | Error alert heading |
| 206 | `'Sign in with your account'` | `auth.login.oauthPrompt` | OAuth section text |
| 222 | `'Or continue with email'` | `auth.login.divider` | Divider text |
| 231-232 | `'Email Address'` | `auth.login.form.emailLabel` | Form label |
| 244 | `'admin@faqbnb.com'` | Consider keeping as-is | Placeholder (example email) |
| 255-256 | `'Password'` | `auth.login.form.passwordLabel` | Form label |
| 269 | `'Enter your password'` | `auth.login.form.passwordPlaceholder` | Placeholder |
| 303-304 | `'Remember me for 30 days'` | `auth.login.form.rememberMe` | Checkbox label |
| 317 | `'Signing In...'` | `auth.login.form.submitting` | Loading state |
| 323 | `'Sign In with Email'` | `auth.login.form.submitButton` | Button text |
| 329-330 | `'Access restricted to authorized administrators only'` | `auth.login.restrictedAccess` | Helper text |

---

## Implementation Approach

### Pattern Reference
Follow the established pattern from `LogoutButton.tsx`:
```typescript
import { useTranslations } from 'next-intl';

function LoginForm({ ... }: LoginFormProps) {
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('errors');

  return <label>{t('form.emailLabel')}</label>;
}
```

### Translation Namespace Structure
The `auth.login` namespace in `/messages/en.json` needs to be expanded with the following structure:

```json
{
  "auth": {
    "login": {
      "oauthPrompt": "Sign in with your account",
      "divider": "Or continue with email",
      "restrictedAccess": "Access restricted to authorized administrators only",
      "form": {
        "emailLabel": "Email Address",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Enter your password",
        "rememberMe": "Remember me for 30 days",
        "submitButton": "Sign In with Email",
        "submitting": "Signing In...",
        "validation": {
          "emailRequired": "Email is required",
          "invalidEmail": "Please enter a valid email address",
          "passwordRequired": "Password is required",
          "passwordMinLength": "Password must be at least {min} characters"
        }
      },
      "error": {
        "title": "Authentication Failed",
        "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
        "accessDenied": "Access denied. Admin privileges are required.",
        "noUserReturned": "Login failed: No user returned"
      }
    }
  }
}
```

---

## Authorized Files and Functions for Modification

### Primary File
| File Path | Modification Scope |
|-----------|-------------------|
| `/src/components/LoginForm.tsx` | Add import, replace all hardcoded strings with `t()` calls |

### Translation Files
| File Path | Modification Scope |
|-----------|-------------------|
| `/messages/en.json` | Add/update `auth.login` namespace entries |
| `/messages/fr.json` | Add French translations for `auth.login` |
| `/messages/es.json` | Add Spanish translations for `auth.login` |
| `/messages/de.json` | Add German translations for `auth.login` |
| `/messages/nl.json` | Add Dutch translations for `auth.login` |
| `/messages/it.json` | Add Italian translations for `auth.login` |

### Functions to Modify
| Function/Component | Location | Changes |
|-------------------|----------|---------|
| `LoginForm` | Line 28-335 | Add `useTranslations` hook, replace strings |
| `validateField` | Lines 48-64 | Replace hardcoded validation messages |
| `handleSubmit` | Lines 108-173 | Replace hardcoded error messages |
| JSX render | Lines 188-334 | Replace all user-facing strings |

---

## Implementation Tasks

### Task 1: Update Translation Files
**Estimate:** Small
**Description:** Add the required translation keys to all 6 language files.

**Steps:**
1. Open `/messages/en.json`
2. Expand the `auth.login` namespace with form-specific keys
3. Use ICU format for variables: `{min}` for password minimum length
4. Copy structure to other language files and translate

**English Translation Keys:**
```json
{
  "auth": {
    "login": {
      "oauthPrompt": "Sign in with your account",
      "divider": "Or continue with email",
      "restrictedAccess": "Access restricted to authorized administrators only",
      "form": {
        "emailLabel": "Email Address",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Enter your password",
        "rememberMe": "Remember me for 30 days",
        "submitButton": "Sign In with Email",
        "submitting": "Signing In...",
        "validation": {
          "emailRequired": "Email is required",
          "invalidEmail": "Please enter a valid email address",
          "passwordRequired": "Password is required",
          "passwordMinLength": "Password must be at least {min} characters"
        }
      },
      "error": {
        "title": "Authentication Failed",
        "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
        "accessDenied": "Access denied. Admin privileges are required.",
        "noUserReturned": "Login failed: No user returned"
      }
    }
  }
}
```

### Task 2: Add useTranslations Import
**Estimate:** Trivial
**Description:** Add the next-intl import to LoginForm.tsx.

**Code Change:**
```typescript
// Add to existing imports (after line 8)
import { useTranslations } from 'next-intl';
```

### Task 3: Initialize Translation Hook
**Estimate:** Trivial
**Description:** Add translation hook initialization inside the component.

**Code Change (after line 31, inside the component function):**
```typescript
const t = useTranslations('auth.login');
```

### Task 4: Update Validation Messages
**Estimate:** Small
**Description:** Replace hardcoded validation messages in validateField function.

**Location:** Lines 48-64

**Before:**
```typescript
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) return 'Please enter a valid email address';
      return undefined;

    case 'password':
      if (!value) return 'Password is required';
      if ((value as string).length < 6) return 'Password must be at least 6 characters';
      return undefined;

    default:
      return undefined;
  }
};
```

**After:**
```typescript
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return t('form.validation.emailRequired');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) return t('form.validation.invalidEmail');
      return undefined;

    case 'password':
      if (!value) return t('form.validation.passwordRequired');
      if ((value as string).length < 6) return t('form.validation.passwordMinLength', { min: 6 });
      return undefined;

    default:
      return undefined;
  }
};
```

### Task 5: Update Error Handling Messages
**Estimate:** Small
**Description:** Replace hardcoded error messages in handleSubmit.

**Location:** Lines 130-144

**Before:**
```typescript
if (errorMessage.includes('Invalid login credentials') ||
    errorMessage.includes('Email not confirmed') ||
    errorMessage.includes('Invalid email or password')) {
  setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
} else if (errorMessage.includes('admin privileges') ||
           errorMessage.includes('Access denied')) {
  setErrors({ general: 'Access denied. Admin privileges are required.' });
} else {
  setErrors({ general: errorMessage });
}
```

**After:**
```typescript
if (errorMessage.includes('Invalid login credentials') ||
    errorMessage.includes('Email not confirmed') ||
    errorMessage.includes('Invalid email or password')) {
  setErrors({ general: t('error.invalidCredentials') });
} else if (errorMessage.includes('admin privileges') ||
           errorMessage.includes('Access denied')) {
  setErrors({ general: t('error.accessDenied') });
} else {
  setErrors({ general: errorMessage });
}
```

**Location:** Lines 160-162

**Before:**
```typescript
setErrors({ general: 'Login failed: No user returned' });
```

**After:**
```typescript
setErrors({ general: t('error.noUserReturned') });
```

### Task 6: Update Error Alert Section
**Estimate:** Trivial
**Description:** Replace hardcoded error alert heading.

**Location:** Lines 191-201

**Before:**
```tsx
<h3 className="text-sm font-medium text-red-800">Authentication Failed</h3>
```

**After:**
```tsx
<h3 className="text-sm font-medium text-red-800">{t('error.title')}</h3>
```

### Task 7: Update OAuth Section
**Estimate:** Trivial
**Description:** Replace OAuth prompt text.

**Location:** Lines 204-207

**Before:**
```tsx
<p className="text-sm font-medium text-gray-700 mb-4">Sign in with your account</p>
```

**After:**
```tsx
<p className="text-sm font-medium text-gray-700 mb-4">{t('oauthPrompt')}</p>
```

### Task 8: Update Divider Text
**Estimate:** Trivial
**Description:** Replace divider text between OAuth and email form.

**Location:** Lines 216-224

**Before:**
```tsx
<span className="px-2 bg-white text-gray-500">Or continue with email</span>
```

**After:**
```tsx
<span className="px-2 bg-white text-gray-500">{t('divider')}</span>
```

### Task 9: Update Form Labels and Placeholders
**Estimate:** Small
**Description:** Replace form field labels and placeholders.

**Location:** Lines 229-251 (Email field)

**Before:**
```tsx
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
  Email Address
</label>
<input
  ...
  placeholder="admin@faqbnb.com"
  ...
/>
```

**After:**
```tsx
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
  {t('form.emailLabel')}
</label>
<input
  ...
  placeholder={t('form.emailPlaceholder')}
  ...
/>
```

**Location:** Lines 253-290 (Password field)

**Before:**
```tsx
<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
  Password
</label>
<input
  ...
  placeholder="Enter your password"
  ...
/>
```

**After:**
```tsx
<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
  {t('form.passwordLabel')}
</label>
<input
  ...
  placeholder={t('form.passwordPlaceholder')}
  ...
/>
```

### Task 10: Update Remember Me Checkbox
**Estimate:** Trivial
**Description:** Replace checkbox label.

**Location:** Lines 292-306

**Before:**
```tsx
<label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
  Remember me for 30 days
</label>
```

**After:**
```tsx
<label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
  {t('form.rememberMe')}
</label>
```

### Task 11: Update Submit Button
**Estimate:** Small
**Description:** Replace submit button text for both loading and normal states.

**Location:** Lines 308-325

**Before:**
```tsx
{loading ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    Signing In...
  </>
) : (
  <>
    <LogIn className="w-4 h-4 mr-2" />
    Sign In with Email
  </>
)}
```

**After:**
```tsx
{loading ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    {t('form.submitting')}
  </>
) : (
  <>
    <LogIn className="w-4 h-4 mr-2" />
    {t('form.submitButton')}
  </>
)}
```

### Task 12: Update Helper Text
**Estimate:** Trivial
**Description:** Replace the restricted access helper text.

**Location:** Lines 327-332

**Before:**
```tsx
<p className="text-sm text-gray-600">
  Access restricted to authorized administrators only
</p>
```

**After:**
```tsx
<p className="text-sm text-gray-600">
  {t('restrictedAccess')}
</p>
```

---

## Dependencies

### Required Before Implementation
- [x] Epic 1 Foundation complete (next-intl installed, IntlProvider configured)
- [ ] Task 2A.1: Create `auth` namespace structure (should be complete or done in parallel)
- [ ] Task 2A.2: Update LoginPageContent.tsx (can be done in parallel)

### Components This Affects
- None - LoginForm is a leaf component

### Components That Depend on This
- `/src/app/login/LoginPageContent.tsx` - Parent component (no changes needed)

---

## Testing Requirements

### Manual Testing Checklist
- [ ] Form renders without errors in English (default)
- [ ] All form labels display correctly in each of the 6 languages
- [ ] Placeholder text is translated in all languages
- [ ] Validation error messages appear translated when fields are invalid
- [ ] "Email is required" shows when submitting empty email
- [ ] "Password must be at least 6 characters" shows with short password
- [ ] Authentication error messages appear translated
- [ ] Loading state shows translated "Signing In..." text
- [ ] Submit button shows translated text
- [ ] OAuth prompt text is translated
- [ ] Divider text ("Or continue with email") is translated
- [ ] Remember me checkbox label is translated
- [ ] Helper text at bottom is translated
- [ ] No console errors related to missing translations
- [ ] Form submission still works correctly after changes
- [ ] Google OAuth flow still works correctly

### Accessibility Verification
- [ ] Form labels maintain proper `htmlFor` associations
- [ ] Error messages are associated with form fields
- [ ] Screen reader announces translated validation errors correctly
- [ ] Tab order is preserved

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys | Low | Medium | Build-time check with next-intl |
| Validation message truncation | Low | Low | Keep messages concise |
| Breaking form validation | Low | High | Test all validation scenarios |
| OAuth flow regression | Low | Medium | Test Google sign-in thoroughly |
| Text overflow in other languages | Medium | Low | German text ~30% longer - verify layout |

---

## Acceptance Criteria Verification

| Criterion | Implementation Task |
|-----------|---------------------|
| All hardcoded text strings identified and catalogued | String Inventory table above |
| Form labels use translation keys | Task 9 |
| Placeholder text uses translation keys | Task 9 |
| Validation messages use translation keys | Task 4 |
| Error messages use translation keys | Task 5, Task 6 |
| Button text uses translation keys | Task 11 |
| Loading state text uses translation keys | Task 11 |
| OAuth section text uses translation keys | Task 7 |
| Divider text uses translation keys | Task 8 |
| Remember me label uses translation keys | Task 10 |
| Helper text uses translation keys | Task 12 |
| Component imports useTranslations | Task 2 |
| Form functionality maintained | Testing Requirements |
| Existing styling maintained | No CSS changes required |
| Accessibility attributes maintained | All label associations preserved |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-356)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [Related Task: REQ-356 LoginPageContent](/docs/REQ-356-update-srcapploginloginpagecontenttsx-overview.md)

---

## Appendix: Complete String Extraction Map

```
LoginForm.tsx String Extraction

┌─────────────────────────────────────────────────────────────────┐
│ VALIDATION MESSAGES (lines 48-64)                               │
├─────────────────────────────────────────────────────────────────┤
│ • "Email is required"         → t('form.validation.emailRequired') │
│ • "Please enter a valid..."   → t('form.validation.invalidEmail')  │
│ • "Password is required"      → t('form.validation.passwordRequired') │
│ • "Password must be at least..."→ t('form.validation.passwordMinLength', {min:6}) │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ERROR HANDLING (lines 130-162)                                  │
├─────────────────────────────────────────────────────────────────┤
│ • "Invalid email or password..."→ t('error.invalidCredentials') │
│ • "Access denied..."           → t('error.accessDenied')        │
│ • "Login failed: No user..."   → t('error.noUserReturned')      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ERROR ALERT (lines 191-201)                                     │
├─────────────────────────────────────────────────────────────────┤
│ • "Authentication Failed"      → t('error.title')               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ OAUTH SECTION (lines 203-214)                                   │
├─────────────────────────────────────────────────────────────────┤
│ • "Sign in with your account"  → t('oauthPrompt')               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DIVIDER (lines 216-224)                                         │
├─────────────────────────────────────────────────────────────────┤
│ • "Or continue with email"     → t('divider')                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ EMAIL FIELD (lines 229-251)                                     │
├─────────────────────────────────────────────────────────────────┤
│ • "Email Address"              → t('form.emailLabel')           │
│ • "admin@faqbnb.com"           → t('form.emailPlaceholder')     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PASSWORD FIELD (lines 253-290)                                  │
├─────────────────────────────────────────────────────────────────┤
│ • "Password"                   → t('form.passwordLabel')        │
│ • "Enter your password"        → t('form.passwordPlaceholder')  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ REMEMBER ME (lines 292-306)                                     │
├─────────────────────────────────────────────────────────────────┤
│ • "Remember me for 30 days"    → t('form.rememberMe')           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SUBMIT BUTTON (lines 308-325)                                   │
├─────────────────────────────────────────────────────────────────┤
│ • "Signing In..."              → t('form.submitting')           │
│ • "Sign In with Email"         → t('form.submitButton')         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HELPER TEXT (lines 327-332)                                     │
├─────────────────────────────────────────────────────────────────┤
│ • "Access restricted to..."    → t('restrictedAccess')          │
└─────────────────────────────────────────────────────────────────┘
```

---

*Document generated for FAQBNB L10N Epic 2 - Task 2A.3*
