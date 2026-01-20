# Detailed Task Breakdown: REQ-E02-041 - Update LoginForm Component for Internationalization

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-041
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.3
**Priority:** P1 - High
**Size:** M (Medium)
**Estimated Story Points:** 3

---

## Executive Summary

This document provides granular, actionable tasks for updating the `LoginForm` component (`/src/components/LoginForm.tsx`) to support internationalization using next-intl. The component currently contains approximately 15 hardcoded English strings across form labels, placeholders, validation messages, button text, and error notifications. All strings will be replaced with translation keys from the `auth.login` namespace.

---

## Prerequisites

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| REQ-E02-039: `auth` namespace structure | Required | Translation keys depend on auth namespace |
| next-intl installed | ✓ Complete | From Epic 1 |
| `/messages/en.json` exists | ✓ Complete | Base translation file exists |
| `useTranslations` hook available | ✓ Complete | next-intl hook ready |

---

## Component Analysis

### File Location
- **Path:** `/src/components/LoginForm.tsx`
- **Type:** Client Component (`'use client'`)
- **Lines of Code:** 336
- **Estimated Hardcoded Strings:** 15

### Current Hardcoded Strings Inventory

| Line | String | Category | Translation Key |
|------|--------|----------|-----------------|
| 196 | "Authentication Failed" | Error Title | `auth.login.error.title` |
| 206 | "Sign in with your account" | OAuth Prompt | `auth.login.oauth.prompt` |
| 222 | "Or continue with email" | Divider | `auth.login.oauth.divider` |
| 232 | "Email Address" | Label | `auth.login.email.label` |
| 244 | "admin@faqbnb.com" | Placeholder | `auth.login.email.placeholder` |
| 255 | "Password" | Label | `auth.login.password.label` |
| 269 | "Enter your password" | Placeholder | `auth.login.password.placeholder` |
| 304 | "Remember me for 30 days" | Checkbox Label | `auth.login.rememberMe` |
| 317 | "Signing In..." | Button Loading | `auth.login.button.loading` |
| 322 | "Sign In with Email" | Button | `auth.login.button.submit` |
| 330 | "Access restricted to authorized administrators only" | Helper Text | `auth.login.helper.restricted` |
| 51 | "Email is required" | Validation | `errors.form.email.required` |
| 53 | "Please enter a valid email address" | Validation | `errors.form.email.invalid` |
| 57 | "Password is required" | Validation | `errors.form.password.required` |
| 58 | "Password must be at least 6 characters" | Validation | `errors.form.password.tooShort` |
| 138 | "Invalid email or password..." | Error | `auth.login.error.invalidCredentials` |
| 141 | "Access denied. Admin privileges are required." | Error | `auth.login.error.accessDenied` |
| 161 | "Login failed: No user returned" | Error | `auth.login.error.noUser` |

---

## Detailed Implementation Tasks

### Task 1: Add Translation Hook Import
**Effort:** XS (5 minutes)
**Story Points:** 0.25

**Description:** Add the `useTranslations` import from next-intl to the existing imports section.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Line 3-8):**
```typescript
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import GoogleOAuthButton from './GoogleOAuthButton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
```

**Modified Code:**
```typescript
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import GoogleOAuthButton from './GoogleOAuthButton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
```

**Acceptance Criteria:**
- [ ] `useTranslations` is imported from 'next-intl'
- [ ] Import is placed with other React/external library imports
- [ ] No TypeScript errors on import

---

### Task 2: Initialize Translation Hooks
**Effort:** XS (5 minutes)
**Story Points:** 0.25

**Description:** Initialize translation hooks for `auth.login` and `errors.form` namespaces at the beginning of the component function.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Lines 28-31):**
```typescript
export default function LoginForm({ onSuccess, onError, className = '' }: LoginFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();
```

**Modified Code:**
```typescript
export default function LoginForm({ onSuccess, onError, className = '' }: LoginFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();

  // Translation hooks
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('errors.form');
```

**Acceptance Criteria:**
- [ ] `t` hook initialized for 'auth.login' namespace
- [ ] `tErrors` hook initialized for 'errors.form' namespace
- [ ] Hooks are placed after existing hooks but before state declarations
- [ ] No TypeScript errors

---

### Task 3: Update Error Alert Section
**Effort:** XS (5 minutes)
**Story Points:** 0.25

**Description:** Replace the hardcoded "Authentication Failed" title in the error alert.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Line 196):**
```typescript
<h3 className="text-sm font-medium text-red-800">Authentication Failed</h3>
```

**Modified Code:**
```typescript
<h3 className="text-sm font-medium text-red-800">{t('error.title')}</h3>
```

**Acceptance Criteria:**
- [ ] "Authentication Failed" replaced with `{t('error.title')}`
- [ ] Error alert displays correctly
- [ ] No layout changes

---

### Task 4: Update OAuth Section Prompt
**Effort:** XS (5 minutes)
**Story Points:** 0.25

**Description:** Replace the OAuth section prompt text.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Line 206):**
```typescript
<p className="text-sm font-medium text-gray-700 mb-4">Sign in with your account</p>
```

**Modified Code:**
```typescript
<p className="text-sm font-medium text-gray-700 mb-4">{t('oauth.prompt')}</p>
```

**Acceptance Criteria:**
- [ ] "Sign in with your account" replaced with `{t('oauth.prompt')}`
- [ ] Text displays correctly
- [ ] Styling preserved

---

### Task 5: Update Divider Text
**Effort:** XS (5 minutes)
**Story Points:** 0.25

**Description:** Replace the divider text between OAuth and email login sections.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Line 222):**
```typescript
<span className="px-2 bg-white text-gray-500">Or continue with email</span>
```

**Modified Code:**
```typescript
<span className="px-2 bg-white text-gray-500">{t('oauth.divider')}</span>
```

**Acceptance Criteria:**
- [ ] "Or continue with email" replaced with `{t('oauth.divider')}`
- [ ] Divider alignment preserved
- [ ] Background color maintained

---

### Task 6: Update Email Field Label and Placeholder
**Effort:** S (10 minutes)
**Story Points:** 0.5

**Description:** Replace the email field label and placeholder text.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Lines 231-232, 244):**
```typescript
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
  Email Address
</label>
// ...
placeholder="admin@faqbnb.com"
```

**Modified Code:**
```typescript
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
  {t('email.label')}
</label>
// ...
placeholder={t('email.placeholder')}
```

**Acceptance Criteria:**
- [ ] "Email Address" label replaced with `{t('email.label')}`
- [ ] Placeholder "admin@faqbnb.com" replaced with `{t('email.placeholder')}`
- [ ] Field continues to function correctly
- [ ] Auto-complete behavior unchanged

---

### Task 7: Update Password Field Label and Placeholder
**Effort:** S (10 minutes)
**Story Points:** 0.5

**Description:** Replace the password field label and placeholder text.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Lines 255-256, 269):**
```typescript
<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
  Password
</label>
// ...
placeholder="Enter your password"
```

**Modified Code:**
```typescript
<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
  {t('password.label')}
</label>
// ...
placeholder={t('password.placeholder')}
```

**Acceptance Criteria:**
- [ ] "Password" label replaced with `{t('password.label')}`
- [ ] Placeholder replaced with `{t('password.placeholder')}`
- [ ] Password visibility toggle continues to work
- [ ] Auto-complete behavior unchanged

---

### Task 8: Update Remember Me Checkbox Label
**Effort:** XS (5 minutes)
**Story Points:** 0.25

**Description:** Replace the "Remember me for 30 days" checkbox label.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Lines 303-305):**
```typescript
<label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
  Remember me for 30 days
</label>
```

**Modified Code:**
```typescript
<label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
  {t('rememberMe')}
</label>
```

**Acceptance Criteria:**
- [ ] "Remember me for 30 days" replaced with `{t('rememberMe')}`
- [ ] Checkbox association preserved
- [ ] Clickable label area unchanged

---

### Task 9: Update Submit Button Text
**Effort:** S (10 minutes)
**Story Points:** 0.5

**Description:** Replace the submit button text for both loading and default states.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Lines 314-324):**
```typescript
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

**Modified Code:**
```typescript
{loading ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    {t('button.loading')}
  </>
) : (
  <>
    <LogIn className="w-4 h-4 mr-2" />
    {t('button.submit')}
  </>
)}
```

**Acceptance Criteria:**
- [ ] "Signing In..." replaced with `{t('button.loading')}`
- [ ] "Sign In with Email" replaced with `{t('button.submit')}`
- [ ] Loading spinner animation preserved
- [ ] Button disabled states work correctly

---

### Task 10: Update Helper Text
**Effort:** XS (5 minutes)
**Story Points:** 0.25

**Description:** Replace the restricted access helper text at the bottom of the form.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Lines 328-331):**
```typescript
<div className="text-center">
  <p className="text-sm text-gray-600">
    Access restricted to authorized administrators only
  </p>
</div>
```

**Modified Code:**
```typescript
<div className="text-center">
  <p className="text-sm text-gray-600">
    {t('helper.restricted')}
  </p>
</div>
```

**Acceptance Criteria:**
- [ ] Helper text replaced with `{t('helper.restricted')}`
- [ ] Text alignment preserved
- [ ] Styling maintained

---

### Task 11: Update Validation Function - Email Errors
**Effort:** M (20 minutes)
**Story Points:** 1

**Description:** Refactor the `validateField` function to use translation keys for email validation errors. Since validation runs outside React render context, we need to use a callback pattern.

**File:** `/src/components/LoginForm.tsx`

**Implementation Strategy:**
The `validateField` function runs outside the React render cycle, so we cannot call hooks directly. We'll return error keys that are resolved when displayed.

**Current Code (Lines 48-54):**
```typescript
case 'email':
  if (!value) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value as string)) return 'Please enter a valid email address';
  return undefined;
```

**Modified Code:**
```typescript
case 'email':
  if (!value) return tErrors('email.required');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value as string)) return tErrors('email.invalid');
  return undefined;
```

**Note:** The `tErrors` hook reference needs to be accessible within `validateField`. This requires restructuring the function to be defined inside the component body after hook initialization.

**Alternative Approach (Recommended):**
Define `validateField` as an inner function after hooks are initialized:

```typescript
export default function LoginForm({ onSuccess, onError, className = '' }: LoginFormProps) {
  // ... existing hooks ...
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('errors.form');

  // Move validateField inside component to access tErrors
  const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
    switch (name) {
      case 'email':
        if (!value) return tErrors('email.required');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value as string)) return tErrors('email.invalid');
        return undefined;
      // ... rest of function
    }
  };
```

**Acceptance Criteria:**
- [ ] "Email is required" replaced with `tErrors('email.required')`
- [ ] "Please enter a valid email address" replaced with `tErrors('email.invalid')`
- [ ] Validation still triggers correctly on field blur/submit
- [ ] Error messages display in form
- [ ] Function has access to translation hooks

---

### Task 12: Update Validation Function - Password Errors
**Effort:** S (10 minutes)
**Story Points:** 0.5

**Description:** Update password validation error messages to use translation keys.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Lines 56-59):**
```typescript
case 'password':
  if (!value) return 'Password is required';
  if ((value as string).length < 6) return 'Password must be at least 6 characters';
  return undefined;
```

**Modified Code:**
```typescript
case 'password':
  if (!value) return tErrors('password.required');
  if ((value as string).length < 6) return tErrors('password.tooShort');
  return undefined;
```

**Note:** For the "tooShort" message, we can use ICU formatting with variables if needed:
```typescript
// In translation file:
"password.tooShort": "Password must be at least {min} characters"

// In component:
tErrors('password.tooShort', { min: 6 })
```

**Acceptance Criteria:**
- [ ] "Password is required" replaced with `tErrors('password.required')`
- [ ] "Password must be at least 6 characters" replaced with `tErrors('password.tooShort')` or `tErrors('password.tooShort', { min: 6 })`
- [ ] Validation triggers correctly
- [ ] Error messages display properly

---

### Task 13: Update Error Handling Messages
**Effort:** M (15 minutes)
**Story Points:** 1

**Description:** Update the error messages in the `handleSubmit` function for authentication errors.

**File:** `/src/components/LoginForm.tsx`

**Current Code (Lines 134-144):**
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

**Modified Code:**
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

**Current Code (Lines 160-162):**
```typescript
console.error('🔐 LOGIN_FORM: Authentication failed: No user returned');
setErrors({ general: 'Login failed: No user returned' });
onError?.('Login failed: No user returned');
```

**Modified Code:**
```typescript
console.error('🔐 LOGIN_FORM: Authentication failed: No user returned');
setErrors({ general: t('error.noUser') });
onError?.(t('error.noUser'));
```

**Acceptance Criteria:**
- [ ] Invalid credentials error uses `t('error.invalidCredentials')`
- [ ] Access denied error uses `t('error.accessDenied')`
- [ ] No user error uses `t('error.noUser')`
- [ ] Error callback receives translated message
- [ ] Console logs remain in English (for debugging)

---

### Task 14: Add Translation Keys to English Translation File
**Effort:** M (20 minutes)
**Story Points:** 1

**Description:** Add all new translation keys to `/messages/en.json` under the `auth.login` namespace and update the `errors.form` namespace.

**File:** `/messages/en.json`

**Keys to Add Under `auth.login`:**
```json
{
  "auth": {
    "login": {
      "error": {
        "title": "Authentication Failed",
        "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
        "accessDenied": "Access denied. Admin privileges are required.",
        "noUser": "Login failed: No user returned"
      },
      "oauth": {
        "prompt": "Sign in with your account",
        "divider": "Or continue with email"
      },
      "email": {
        "label": "Email Address",
        "placeholder": "admin@faqbnb.com"
      },
      "password": {
        "label": "Password",
        "placeholder": "Enter your password"
      },
      "rememberMe": "Remember me for 30 days",
      "button": {
        "submit": "Sign In with Email",
        "loading": "Signing In..."
      },
      "helper": {
        "restricted": "Access restricted to authorized administrators only"
      }
    }
  }
}
```

**Keys to Add/Update Under `errors.form`:**
```json
{
  "errors": {
    "form": {
      "email": {
        "required": "Email is required",
        "invalid": "Please enter a valid email address"
      },
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least 6 characters"
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All `auth.login.*` keys added with correct nesting
- [ ] All `errors.form.*` keys added with correct nesting
- [ ] JSON file remains valid (no syntax errors)
- [ ] Existing keys not modified or removed
- [ ] Keys follow established naming convention

---

### Task 15: Verify Component Renders Correctly
**Effort:** S (15 minutes)
**Story Points:** 0.5

**Description:** Verify the LoginForm component renders correctly with all translated strings and maintains full functionality.

**Test Cases:**

| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| TC-001 | Load login page | All text displays in English |
| TC-002 | Submit empty form | Email and password validation errors display |
| TC-003 | Submit invalid email | "Please enter a valid email address" displays |
| TC-004 | Submit short password | "Password must be at least 6 characters" displays |
| TC-005 | Submit wrong credentials | "Invalid email or password..." error displays |
| TC-006 | Click "Remember me" | Checkbox toggles, label displays correctly |
| TC-007 | Click submit (loading) | "Signing In..." shows with spinner |
| TC-008 | Error alert display | "Authentication Failed" title shows |

**Acceptance Criteria:**
- [ ] All translated strings render correctly
- [ ] No missing translation warnings in console
- [ ] Form validation flow unchanged
- [ ] Form submission flow unchanged
- [ ] OAuth section displays correctly
- [ ] Loading states work properly
- [ ] Error states display correctly

---

### Task 16: Test Layout with Different Text Lengths
**Effort:** S (15 minutes)
**Story Points:** 0.5

**Description:** Verify form layout accommodates potential text length variations that may occur in other languages.

**Test Approach:**
1. Temporarily modify translation strings to be 40% longer
2. Verify no text overflow or truncation
3. Check button text fits within button bounds
4. Verify error messages wrap correctly

**Acceptance Criteria:**
- [ ] Labels don't overflow their containers
- [ ] Placeholders don't get truncated
- [ ] Button text fits without breaking layout
- [ ] Error messages wrap gracefully
- [ ] Divider text centers correctly with longer text

---

## Implementation Checklist

### Pre-Implementation
- [ ] Verify REQ-E02-039 (`auth` namespace structure) is complete
- [ ] Verify `/messages/en.json` contains `auth` section
- [ ] Verify next-intl is configured in the project

### Implementation
- [ ] Task 1: Add Translation Hook Import
- [ ] Task 2: Initialize Translation Hooks
- [ ] Task 3: Update Error Alert Section
- [ ] Task 4: Update OAuth Section Prompt
- [ ] Task 5: Update Divider Text
- [ ] Task 6: Update Email Field Label and Placeholder
- [ ] Task 7: Update Password Field Label and Placeholder
- [ ] Task 8: Update Remember Me Checkbox Label
- [ ] Task 9: Update Submit Button Text
- [ ] Task 10: Update Helper Text
- [ ] Task 11: Update Validation Function - Email Errors
- [ ] Task 12: Update Validation Function - Password Errors
- [ ] Task 13: Update Error Handling Messages
- [ ] Task 14: Add Translation Keys to English Translation File
- [ ] Task 15: Verify Component Renders Correctly
- [ ] Task 16: Test Layout with Different Text Lengths

### Post-Implementation
- [ ] Run `npm run build` to verify no TypeScript errors
- [ ] Run `npm run lint` to verify no linting errors
- [ ] Manual test of complete login flow
- [ ] Verify no console warnings about missing translations

---

## Files Modified

| File | Type | Changes |
|------|------|---------|
| `/src/components/LoginForm.tsx` | Component | Add translations hook, replace 15 hardcoded strings |
| `/messages/en.json` | Translation | Add `auth.login.*` and `errors.form.*` keys |

---

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| `validateField` function scope issues | High | Medium | Move function inside component body after hooks |
| Missing translation keys cause runtime errors | Medium | Low | Add all keys before deploying component changes |
| Layout breaks with longer translated text | Low | Medium | Design with 40% text expansion buffer |
| Error handling disrupted | High | Low | Test all error scenarios thoroughly |

---

## Acceptance Criteria (from REQ-E02-041)

- [ ] Email field label uses translation key from auth.login namespace
- [ ] Email field placeholder text uses translation key
- [ ] Password field label uses translation key from auth.login namespace
- [ ] Password field placeholder text uses translation key
- [ ] "Sign In" or "Log In" button text uses translation key
- [ ] "Signing in..." loading state button text uses translation key
- [ ] "Or continue with" social login section heading uses translation key
- [ ] Form validation error "Email is required" uses translation key
- [ ] Form validation error "Invalid email format" uses translation key
- [ ] Form validation error "Password is required" uses translation key
- [ ] Form validation error "Password must be at least X characters" uses translation key
- [ ] Error notification "Invalid credentials" uses translation key
- [ ] Generic error fallback message uses translation key
- [ ] Component imports and uses the useTranslations hook from next-intl
- [ ] Translation keys follow the established auth.login.* namespace structure
- [ ] All extracted strings are added to English base translation file
- [ ] Client-side form validation messages are fully localized
- [ ] Field-level error messages display correctly in all supported languages
- [ ] Form submission flow remains unchanged functionally
- [ ] Visual regression testing confirms form layout accommodates text length variations

---

## References

- [Overview Document](/docs/REQ-E02-041-update-srccomponentsloginformtsx-overview.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-041
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Component File](/src/components/LoginForm.tsx)
- [Translation File](/messages/en.json)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

## Estimated Total Effort

| Category | Story Points |
|----------|--------------|
| Import & Setup (Tasks 1-2) | 0.5 |
| UI String Replacement (Tasks 3-10) | 2.75 |
| Validation & Error Handling (Tasks 11-13) | 2.5 |
| Translation File Updates (Task 14) | 1.0 |
| Testing & Verification (Tasks 15-16) | 1.0 |
| **Total** | **7.75** |

**Recommended Sprint Allocation:** 1 developer, 0.5-1 day

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A: Authentication & Registration*
*Task ID: 2A.3 - Update LoginForm Component*
