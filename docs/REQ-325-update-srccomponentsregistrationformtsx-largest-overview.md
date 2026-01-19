# REQ-325: Internationalize RegistrationForm Component - Implementation Overview

**Created:** 2026-01-18 04:30:00 UTC
**Last Modified:** 2026-01-18 04:30:00 UTC
**Request Reference:** gen_requests_epic2.md - Request #325
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.4
**Priority:** High (Fourth in Sub-Epic 2A sequence, largest file in auth flow)

---

## Executive Summary

This document provides the implementation breakdown for internationalizing the `RegistrationForm` component located at `/src/components/RegistrationForm.tsx`. The component is the **largest file in the authentication flow** (975 lines) and contains approximately **65+ hardcoded English strings** that need to be extracted and replaced with translation function calls using the `next-intl` framework. This includes form labels, placeholders, validation error messages, password strength indicators, registration method selection labels, terms/privacy consent text, and various user feedback messages.

This task is part of Sub-Epic 2A (Authentication & Registration) and completes the core registration flow localization when combined with REQ-322 (Auth Namespace), REQ-323 (LoginPageContent), and REQ-324 (LoginForm).

---

## Dependencies

### Prerequisites (Must Be Completed First)

| Dependency | Status | Description |
|------------|--------|-------------|
| **Epic 1: L10N Foundation** | Required | `next-intl` package installation, i18n configuration, IntlProvider setup |
| **Task 2H.1: Common Namespace** | Required | Base `common` namespace in `/messages/en.json` for shared strings |
| **Task 2A.1: Auth Namespace (REQ-322)** | Required | `auth` namespace structure in `/messages/en.json` |
| **Task 2A.2: LoginPageContent (REQ-323)** | Recommended | Establishes `auth.login` namespace patterns |
| **Task 2A.3: LoginForm (REQ-324)** | Recommended | Establishes validation/error message patterns |

**Critical Blocker:** The `next-intl` package must be installed (Epic 1 foundation) before this task can be implemented.

### Package Dependencies

```json
{
  "next-intl": "^3.x" // Required from Epic 1
}
```

---

## Current State Analysis

### Component Location
`/src/components/RegistrationForm.tsx` (975 lines)

### Component Type
- **React Type:** Client Component (`'use client'` directive)
- **Translation Method:** `useTranslations` hook from `next-intl`

### Component Structure
The RegistrationForm is a complex, feature-rich component with:
- Email field (pre-filled, read-only from access code)
- Full name field (optional)
- Password and confirm password fields with strength indicator
- Password visibility toggles
- **Registration method selector** (REQ-222: Google OAuth vs Email/Password for Gmail users)
- Terms and conditions checkbox with clickable links
- Access code display panel
- General error alert section
- Dynamic OAuth integration
- Conditional field visibility based on registration method

### Identified Hardcoded Strings (65+ strings)

#### General Error Section (2 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 665 | `"Registration Failed"` | `auth.signup.errors.registrationFailed` |
| 666 | `{errors.general}` (dynamic) | (error message passed from validation/auth) |

#### Access Code Info Panel (1 string)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 677 | `"Access code:"` | `auth.signup.accessCode.label` |

#### Email Field (2 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 686 | `"Email Address"` | `auth.signup.form.emailLabel` |
| 698 | `"email@example.com"` (placeholder) | `auth.signup.form.emailPlaceholder` |
| 701 | `"This email is linked to your access code and cannot be changed."` | `auth.signup.form.emailLinked` |

#### Registration Method Selector (5 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 571 | `"Choose how to create your account"` | `auth.signup.method.title` |
| 558 | `"Continue with Google"` | `auth.signup.method.google.label` |
| 559 | `"Quick sign-up using your Google account"` | `auth.signup.method.google.description` |
| 562 | `"Sign up with email"` | `auth.signup.method.email.label` |
| 563 | `"Create a password for your account"` | `auth.signup.method.email.description` |

#### Divider Text (1 string)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 650 | `"Enter your details below"` | `auth.signup.form.divider` |

#### Full Name Field (2 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 717-718 | `"Full Name"` + `"(optional)"` | `auth.signup.form.fullNameLabel`, `auth.signup.form.optional` |
| 730 | `"John Doe"` (placeholder) | `auth.signup.form.fullNamePlaceholder` |

#### Password Field (2 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 744 | `"Password"` | `auth.signup.form.passwordLabel` |
| 758 | `"Create a strong password"` (placeholder) | `auth.signup.form.passwordPlaceholder` |

#### Password Strength Indicator (11 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 157 | `"Enter password"` | `auth.signup.passwordStrength.enter` |
| 167 | `"At least 8 characters"` | `auth.signup.passwordStrength.req.minChars` |
| 175 | `"One lowercase letter"` | `auth.signup.passwordStrength.req.lowercase` |
| 183 | `"One uppercase letter"` | `auth.signup.passwordStrength.req.uppercase` |
| 191 | `"One number"` | `auth.signup.passwordStrength.req.number` |
| 199 | `"One special character"` | `auth.signup.passwordStrength.req.special` |
| 199 | `"Very Weak"` | `auth.signup.passwordStrength.labels.veryWeak` |
| 199 | `"Weak"` | `auth.signup.passwordStrength.labels.weak` |
| 199 | `"Fair"` | `auth.signup.passwordStrength.labels.fair` |
| 199 | `"Good"` | `auth.signup.passwordStrength.labels.good` |
| 199 | `"Strong"` | `auth.signup.passwordStrength.labels.strong` |
| 781 | `"Password strength:"` | `auth.signup.passwordStrength.label` |
| 794 | `"Requirements:"` | `auth.signup.passwordStrength.requirements` |

#### Confirm Password Field (4 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 819 | `"Confirm Password"` | `auth.signup.form.confirmPasswordLabel` |
| 834 | `"Confirm your password"` (placeholder) | `auth.signup.form.confirmPasswordPlaceholder` |
| 859 | `"Passwords match"` | `auth.signup.passwordMatch.match` |
| 864 | `"Passwords do not match"` | `auth.signup.passwordMatch.noMatch` |

#### Terms and Conditions (4 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 891-892 | `"I agree to the"` | `auth.signup.terms.agree` |
| 902 | `"Terms of Service"` | `auth.signup.terms.termsOfService` |
| 903 | `"and"` | `auth.signup.terms.and` |
| 913 | `"Privacy Policy"` | `auth.signup.terms.privacyPolicy` |

#### Submit Buttons (4 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 934 | `"Connecting to Google..."` | `auth.signup.buttons.connectingGoogle` |
| 944 | `"Create Account"` (Google) | `auth.signup.buttons.createAccount` |
| 955 | `"Creating Account..."` | `auth.signup.buttons.creatingAccount` |
| 961 | `"Create Account"` (Email) | `auth.signup.buttons.createAccount` |

#### Helper Text (1 string)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 970 | `"Your account will be linked to your verified access code"` | `auth.signup.form.accountLinked` |

#### Validation Error Messages (9 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 215 | `"Email is required"` | `auth.signup.validation.emailRequired` |
| 217 | `"Please enter a valid email address"` | `auth.signup.validation.emailInvalid` |
| 221 | `"Password is required"` | `auth.signup.validation.passwordRequired` |
| 223 | `"Password must be at least 8 characters"` | `auth.signup.validation.passwordMinLength` |
| 224 | `"Password must contain at least one lowercase letter"` | `auth.signup.validation.passwordLowercase` |
| 225 | `"Password must contain at least one uppercase letter"` | `auth.signup.validation.passwordUppercase` |
| 226 | `"Password must contain at least one number"` | `auth.signup.validation.passwordNumber` |
| 230 | `"Please confirm your password"` | `auth.signup.validation.confirmRequired` |
| 231 | `"Passwords do not match"` | `auth.signup.validation.passwordMismatch` |
| 235 | `"Name must be at least 2 characters"` | `auth.signup.validation.nameTooShort` |
| 239 | `"You must agree to the terms and conditions"` | `auth.signup.validation.termsRequired` |

---

## Implementation Tasks

### Task 2A.4.1: Add next-intl Import and Hook Setup
**Effort:** 5 minutes

Add the `useTranslations` hook import and initialize translation instance:

```typescript
// Add import at top of file (after existing imports)
import { useTranslations } from 'next-intl';

// Inside RegistrationForm component, at the start of the function body
const t = useTranslations('auth.signup');
```

### Task 2A.4.2: Update Password Strength Indicator Strings
**Effort:** 20 minutes

This section requires careful translation since the labels array and feedback are computed:

**Before (calculatePasswordStrength function):**
```typescript
const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedback: [], color: 'gray-300', label: 'Enter password' };
  }
  // ...
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('At least 8 characters');
  }
  // ... more checks
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  // ...
};
```

**After:**
Since `calculatePasswordStrength` is called before `t` is available (it's outside the component), we need to refactor to use translation keys instead of strings:

```typescript
// Change function to return keys instead of strings
const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedback: [], color: 'gray-300', labelKey: 'enter' };
  }
  // ...
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('req.minChars');
  }
  // ... similar for other checks
  const labelKeys = ['veryWeak', 'weak', 'fair', 'good', 'strong'];
  return {
    score: Math.min(score, 4),
    feedback,
    color: colors[Math.min(score, 4)],
    labelKey: labelKeys[Math.min(score, 4)]
  };
};

// In component JSX, translate the keys:
{passwordStrength.labelKey && (
  <span>{t(`passwordStrength.labels.${passwordStrength.labelKey}`)}</span>
)}
{passwordStrength.feedback.map((feedbackKey, index) => (
  <li key={index}>{t(`passwordStrength.${feedbackKey}`)}</li>
))}
```

**Alternative Approach (simpler):** Move the translation inside the component and create a helper:

```typescript
// Inside component
const getPasswordStrengthLabel = (score: number): string => {
  const labels = [
    t('passwordStrength.labels.veryWeak'),
    t('passwordStrength.labels.weak'),
    t('passwordStrength.labels.fair'),
    t('passwordStrength.labels.good'),
    t('passwordStrength.labels.strong')
  ];
  return labels[Math.min(score, 4)];
};

const getPasswordFeedback = (feedback: string[]): string[] => {
  const feedbackMap: Record<string, string> = {
    'At least 8 characters': t('passwordStrength.req.minChars'),
    'One lowercase letter': t('passwordStrength.req.lowercase'),
    'One uppercase letter': t('passwordStrength.req.uppercase'),
    'One number': t('passwordStrength.req.number'),
    'One special character': t('passwordStrength.req.special'),
  };
  return feedback.map(f => feedbackMap[f] || f);
};
```

### Task 2A.4.3: Update Validation Error Messages
**Effort:** 15 minutes

Update the `validateField` function to use translated messages:

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
      const password = value as string;
      if (password.length < 8) return 'Password must be at least 8 characters';
      if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
      if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
      if (!/\d/.test(password)) return 'Password must contain at least one number';
      return undefined;

    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      if (value !== formData.password) return 'Passwords do not match';
      return undefined;

    case 'fullName':
      if (value && (value as string).length < 2) return 'Name must be at least 2 characters';
      return undefined;

    case 'agreeToTerms':
      if (!value) return 'You must agree to the terms and conditions';
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
      if (!value) return t('validation.emailRequired');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) return t('validation.emailInvalid');
      return undefined;

    case 'password':
      if (!value) return t('validation.passwordRequired');
      const password = value as string;
      if (password.length < 8) return t('validation.passwordMinLength');
      if (!/[a-z]/.test(password)) return t('validation.passwordLowercase');
      if (!/[A-Z]/.test(password)) return t('validation.passwordUppercase');
      if (!/\d/.test(password)) return t('validation.passwordNumber');
      return undefined;

    case 'confirmPassword':
      if (!value) return t('validation.confirmRequired');
      if (value !== formData.password) return t('validation.passwordMismatch');
      return undefined;

    case 'fullName':
      if (value && (value as string).length < 2) return t('validation.nameTooShort');
      return undefined;

    case 'agreeToTerms':
      if (!value) return t('validation.termsRequired');
      return undefined;

    default:
      return undefined;
  }
};
```

### Task 2A.4.4: Update Registration Method Selector
**Effort:** 10 minutes

**Before:**
```typescript
const REGISTRATION_METHOD_OPTIONS = [
  {
    id: 'google' as const,
    label: 'Continue with Google',
    description: 'Quick sign-up using your Google account'
  },
  {
    id: 'email-password' as const,
    label: 'Sign up with email',
    description: 'Create a password for your account'
  }
];
```

**After:** Move inside component and use translations:
```typescript
// Inside component
const REGISTRATION_METHOD_OPTIONS = [
  {
    id: 'google' as const,
    label: t('method.google.label'),
    description: t('method.google.description')
  },
  {
    id: 'email-password' as const,
    label: t('method.email.label'),
    description: t('method.email.description')
  }
];
```

**Also update label text:**

**Before:**
```tsx
<label className="block text-sm font-medium text-gray-700">
  Choose how to create your account
</label>
```

**After:**
```tsx
<label className="block text-sm font-medium text-gray-700">
  {t('method.title')}
</label>
```

### Task 2A.4.5: Update Error Alert Section
**Effort:** 5 minutes

**Before:**
```tsx
<h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
```

**After:**
```tsx
<h3 className="text-sm font-medium text-red-800">{t('errors.registrationFailed')}</h3>
```

### Task 2A.4.6: Update Access Code Panel
**Effort:** 5 minutes

**Before:**
```tsx
<p className="text-sm text-green-800">
  Access code: <span className="font-mono font-semibold">{accessCode.substring(0, 4)}...</span>
</p>
```

**After:**
```tsx
<p className="text-sm text-green-800">
  {t('accessCode.label')} <span className="font-mono font-semibold">{accessCode.substring(0, 4)}...</span>
</p>
```

### Task 2A.4.7: Update Email Field
**Effort:** 5 minutes

**Before:**
```tsx
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
  Email Address
</label>
<input
  ...
  placeholder="email@example.com"
  ...
/>
<p className="text-xs text-gray-500 mt-1">
  This email is linked to your access code and cannot be changed.
</p>
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
<p className="text-xs text-gray-500 mt-1">
  {t('form.emailLinked')}
</p>
```

### Task 2A.4.8: Update Divider Text
**Effort:** 5 minutes

**Before:**
```tsx
<span className="px-2 bg-white text-gray-500">Enter your details below</span>
```

**After:**
```tsx
<span className="px-2 bg-white text-gray-500">{t('form.divider')}</span>
```

### Task 2A.4.9: Update Full Name Field
**Effort:** 5 minutes

**Before:**
```tsx
<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
  Full Name <span className="text-gray-400">(optional)</span>
</label>
<input
  ...
  placeholder="John Doe"
  ...
/>
```

**After:**
```tsx
<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
  {t('form.fullNameLabel')} <span className="text-gray-400">{t('form.optional')}</span>
</label>
<input
  ...
  placeholder={t('form.fullNamePlaceholder')}
  ...
/>
```

### Task 2A.4.10: Update Password Field Labels and Placeholders
**Effort:** 10 minutes

**Before:**
```tsx
<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
  Password
</label>
<input
  ...
  placeholder="Create a strong password"
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

**Also update password strength display:**

**Before:**
```tsx
<span className="text-gray-600">Password strength:</span>
// ...
<p className="text-xs text-gray-600">Requirements:</p>
```

**After:**
```tsx
<span className="text-gray-600">{t('passwordStrength.label')}</span>
// ...
<p className="text-xs text-gray-600">{t('passwordStrength.requirements')}</p>
```

### Task 2A.4.11: Update Confirm Password Field
**Effort:** 10 minutes

**Before:**
```tsx
<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
  Confirm Password
</label>
<input
  ...
  placeholder="Confirm your password"
  ...
/>
// Password match indicator
{formData.password === formData.confirmPassword ? (
  <>
    <Check className="h-3 w-3 text-green-600 mr-1" />
    <span className="text-xs text-green-600">Passwords match</span>
  </>
) : (
  <>
    <AlertCircle className="h-3 w-3 text-red-600 mr-1" />
    <span className="text-xs text-red-600">Passwords do not match</span>
  </>
)}
```

**After:**
```tsx
<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
  {t('form.confirmPasswordLabel')}
</label>
<input
  ...
  placeholder={t('form.confirmPasswordPlaceholder')}
  ...
/>
// Password match indicator
{formData.password === formData.confirmPassword ? (
  <>
    <Check className="h-3 w-3 text-green-600 mr-1" />
    <span className="text-xs text-green-600">{t('passwordMatch.match')}</span>
  </>
) : (
  <>
    <AlertCircle className="h-3 w-3 text-red-600 mr-1" />
    <span className="text-xs text-red-600">{t('passwordMatch.noMatch')}</span>
  </>
)}
```

### Task 2A.4.12: Update Terms and Conditions
**Effort:** 10 minutes

**Before:**
```tsx
<label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700">
  I agree to the{' '}
  <button type="button" className="text-blue-600 hover:text-blue-700 underline" ...>
    Terms of Service
  </button>
  {' '}and{' '}
  <button type="button" className="text-blue-600 hover:text-blue-700 underline" ...>
    Privacy Policy
  </button>
</label>
```

**After:**
```tsx
<label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700">
  {t('terms.agree')}{' '}
  <button type="button" className="text-blue-600 hover:text-blue-700 underline" ...>
    {t('terms.termsOfService')}
  </button>
  {' '}{t('terms.and')}{' '}
  <button type="button" className="text-blue-600 hover:text-blue-700 underline" ...>
    {t('terms.privacyPolicy')}
  </button>
</label>
```

### Task 2A.4.13: Update Submit Buttons
**Effort:** 10 minutes

**Google OAuth Button (for Gmail users with Google method selected):**

**Before:**
```tsx
{isOAuthActive ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    Connecting to Google...
  </>
) : (
  <>
    <img src="..." alt="Google" ... />
    Create Account
  </>
)}
```

**After:**
```tsx
{isOAuthActive ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    {t('buttons.connectingGoogle')}
  </>
) : (
  <>
    <img src="..." alt="Google" ... />
    {t('buttons.createAccount')}
  </>
)}
```

**Email/Password Submit Button:**

**Before:**
```tsx
{isLoading ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    Creating Account...
  </>
) : (
  <>
    <UserPlus className="w-4 h-4 mr-2" />
    Create Account
  </>
)}
```

**After:**
```tsx
{isLoading ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    {t('buttons.creatingAccount')}
  </>
) : (
  <>
    <UserPlus className="w-4 h-4 mr-2" />
    {t('buttons.createAccount')}
  </>
)}
```

### Task 2A.4.14: Update Helper Text
**Effort:** 5 minutes

**Before:**
```tsx
<p className="text-sm text-gray-600">
  Your account will be linked to your verified access code
</p>
```

**After:**
```tsx
<p className="text-sm text-gray-600">
  {t('form.accountLinked')}
</p>
```

### Task 2A.4.15: Add Translation Keys to en.json
**Effort:** 20 minutes

Add the required keys to `/messages/en.json` under the `auth.signup` namespace:

```json
{
  "auth": {
    "signup": {
      "form": {
        "emailLabel": "Email Address",
        "emailPlaceholder": "email@example.com",
        "emailLinked": "This email is linked to your access code and cannot be changed.",
        "fullNameLabel": "Full Name",
        "fullNamePlaceholder": "John Doe",
        "optional": "(optional)",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Create a strong password",
        "confirmPasswordLabel": "Confirm Password",
        "confirmPasswordPlaceholder": "Confirm your password",
        "divider": "Enter your details below",
        "accountLinked": "Your account will be linked to your verified access code"
      },
      "method": {
        "title": "Choose how to create your account",
        "google": {
          "label": "Continue with Google",
          "description": "Quick sign-up using your Google account"
        },
        "email": {
          "label": "Sign up with email",
          "description": "Create a password for your account"
        }
      },
      "accessCode": {
        "label": "Access code:"
      },
      "passwordStrength": {
        "label": "Password strength:",
        "requirements": "Requirements:",
        "enter": "Enter password",
        "labels": {
          "veryWeak": "Very Weak",
          "weak": "Weak",
          "fair": "Fair",
          "good": "Good",
          "strong": "Strong"
        },
        "req": {
          "minChars": "At least 8 characters",
          "lowercase": "One lowercase letter",
          "uppercase": "One uppercase letter",
          "number": "One number",
          "special": "One special character"
        }
      },
      "passwordMatch": {
        "match": "Passwords match",
        "noMatch": "Passwords do not match"
      },
      "terms": {
        "agree": "I agree to the",
        "termsOfService": "Terms of Service",
        "and": "and",
        "privacyPolicy": "Privacy Policy"
      },
      "buttons": {
        "createAccount": "Create Account",
        "creatingAccount": "Creating Account...",
        "connectingGoogle": "Connecting to Google..."
      },
      "validation": {
        "emailRequired": "Email is required",
        "emailInvalid": "Please enter a valid email address",
        "passwordRequired": "Password is required",
        "passwordMinLength": "Password must be at least 8 characters",
        "passwordLowercase": "Password must contain at least one lowercase letter",
        "passwordUppercase": "Password must contain at least one uppercase letter",
        "passwordNumber": "Password must contain at least one number",
        "confirmRequired": "Please confirm your password",
        "passwordMismatch": "Passwords do not match",
        "nameTooShort": "Name must be at least 2 characters",
        "termsRequired": "You must agree to the terms and conditions"
      },
      "errors": {
        "registrationFailed": "Registration Failed"
      }
    }
  }
}
```

### Task 2A.4.16: Verify Component Rendering
**Effort:** 15 minutes

- Verify the component renders correctly after changes
- Confirm no TypeScript errors related to translation keys
- Test in development environment with default locale
- Test form validation triggers translated error messages
- Test password strength indicator shows translated labels
- Test registration method selector displays translated options
- Test both Google OAuth and email/password registration flows

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Modification Type | Scope |
|-----------|-------------------|-------|
| `/src/components/RegistrationForm.tsx` | Edit | Add imports, replace hardcoded strings with t() calls, refactor password strength helper |
| `/messages/en.json` | Edit | Add `auth.signup` namespace keys |

### Functions/Sections Authorized for Modification

| Function/Section | Location | Changes |
|------------------|----------|---------|
| `RegistrationForm` component | Lines 51-973 | Add `useTranslations` hook |
| `calculatePasswordStrength` function | Lines 155-207 | Refactor to use translation keys instead of hardcoded strings |
| `validateField` function | Lines 212-245 | Replace validation error strings with t() calls |
| `REGISTRATION_METHOD_OPTIONS` constant | Lines 555-566 | Move inside component, use t() for labels and descriptions |
| `registrationMethodSelector` JSX | Lines 569-631 | Replace label text with t() call |
| General error JSX section | Lines 659-670 | Replace "Registration Failed" heading |
| Access code info panel | Lines 673-682 | Replace "Access code:" text |
| Email field JSX | Lines 685-707 | Replace label, placeholder, and helper text |
| OAuth section JSX | Lines 709-655 | Update divider text |
| Full name field JSX | Lines 712-737 | Replace label, optional text, and placeholder |
| Password field JSX | Lines 739-811 | Replace labels, placeholder, and strength indicator text |
| Confirm password field JSX | Lines 814-874 | Replace label, placeholder, and match indicator text |
| Terms checkbox JSX | Lines 876-919 | Replace terms agreement text |
| Google OAuth submit button | Lines 924-946 | Replace button text |
| Email submit button | Lines 947-965 | Replace button text |
| Helper text JSX | Lines 968-972 | Replace account linked text |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/app/login/LoginPageContent.tsx` | Separate task (2A.2 - REQ-323) |
| `/src/components/LoginForm.tsx` | Separate task (2A.3 - REQ-324) |
| `/src/components/GoogleOAuthButton.tsx` | Separate task (2A.5) |
| `/src/hooks/useRegistration.ts` | Outside scope - registration logic hook |
| `/src/app/register/page.tsx` | Separate task (2A.6) |
| `/src/app/register/success/page.tsx` | Separate task (2A.7) |
| `/src/app/register/complete/page.tsx` | Separate task (2A.8) |

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Translation hook pattern | `useTranslations('auth.signup')` | Matches next-intl convention for client components |
| Namespace structure | `auth.signup.*` hierarchical | Clear separation between form, validation, method selector, password strength |
| Password strength refactoring | Use translation key mapping inside component | Avoids breaking the pure function, allows lazy translation lookup |
| Validation error translation | Translate at validation time | Errors displayed immediately; translation context available in component |
| REGISTRATION_METHOD_OPTIONS | Move inside component | Allows access to `t()` function for dynamic translation |
| Console log messages | Keep as hardcoded English | Debug-only, not user-facing |
| Terms of Service/Privacy links | Translate text only | Link destinations are not translatable |

---

## Quality Checklist

### Pre-Implementation
- [ ] Verify Epic 1 foundation is complete (`next-intl` installed)
- [ ] Verify `/messages/en.json` exists with proper structure
- [ ] Verify `auth` namespace structure exists (REQ-322 complete)
- [ ] Verify REQ-323 (LoginPageContent) and REQ-324 (LoginForm) are complete or in progress

### Implementation
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize `t` translation hook with `'auth.signup'` namespace
- [ ] Replace all hardcoded strings identified in this document
- [ ] Refactor password strength function for translation compatibility
- [ ] Move `REGISTRATION_METHOD_OPTIONS` inside component
- [ ] Add all translation keys to `/messages/en.json`
- [ ] Maintain existing component functionality
- [ ] Preserve all error handling behavior

### Post-Implementation
- [ ] TypeScript compilation succeeds with no errors
- [ ] Component renders correctly in development
- [ ] All text displays correctly with translations
- [ ] Registration form validation works as expected
- [ ] Validation error messages display in correct language
- [ ] Password strength indicator shows translated labels
- [ ] Password requirements list is translated
- [ ] Registration method selector options are translated
- [ ] Terms and conditions text is translated
- [ ] Submit buttons show correct translated text for both flows
- [ ] OAuth flow integration remains functional
- [ ] Password visibility toggles work correctly
- [ ] Form submission works correctly (success and error cases)
- [ ] No console errors related to missing translation keys

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Import and hook setup | 5 min |
| Update password strength indicator | 20 min |
| Update validation error messages | 15 min |
| Update registration method selector | 10 min |
| Update error alert section | 5 min |
| Update access code panel | 5 min |
| Update email field | 5 min |
| Update divider text | 5 min |
| Update full name field | 5 min |
| Update password field | 10 min |
| Update confirm password field | 10 min |
| Update terms and conditions | 10 min |
| Update submit buttons | 10 min |
| Update helper text | 5 min |
| Add translation keys to en.json | 20 min |
| Verification and testing | 20 min |
| **Total** | **~160 min (~2.5-3 hours)** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 not complete | High | Critical | Block task until Epic 1 foundation verified |
| Password strength function refactoring complexity | Medium | Medium | Use key mapping approach; test thoroughly |
| Missing translation keys at runtime | Low | Medium | Build-time key validation, fallback to key name |
| Validation timing issues | Low | Low | Translations are synchronous within component lifecycle |
| OAuth flow disruption | Low | Medium | GoogleOAuthButton is not modified in this task |
| Form state not reset on language change | Low | Low | Standard behavior - form retains values on re-render |
| Registration method options not updating | Low | Medium | Move constant inside component for t() access |

---

## Component Interaction Notes

1. **GoogleOAuthButton Integration:** The `GoogleOAuthButton` component is not modified in this task. It receives callbacks (`onAuthStart`, `onAuthError`) but the button itself will be addressed in Task 2A.5.

2. **useRegistration Hook:** The component uses the `useRegistration` hook from `/src/hooks/useRegistration.ts`. Error messages from the hook are passed through; the hook itself is not modified in this task.

3. **Error Display Pattern:** The component uses a two-part error display:
   - `errors.general` for registration errors (heading translated in this task)
   - Field-specific validation errors (all translated in this task)

4. **Console Logs:** The component contains debug console.log statements (prefixed with emoji). These are intentionally kept as hardcoded English since they are development-only.

5. **Registration Method Selection:** The component has Gmail-specific UI (REQ-222) that shows different registration options for Gmail users. Both options need translation.

6. **Password Strength Indicator:** The strength calculation function uses hardcoded strings. This needs refactoring to return translation keys instead.

7. **Conditional Field Visibility:** Fields are conditionally visible based on `showEmailPasswordFields`. Translations must work for both visible and hidden states.

---

## Translation Key Relationship with Other Auth Tasks

This task builds upon the `auth` namespace structure and extends the patterns established in previous tasks:

| Document | Namespace Keys Added |
|----------|---------------------|
| REQ-322 | Base `auth` structure with general keys |
| REQ-323 | `auth.login.loading.*`, `auth.login.messages.*`, `auth.login.securityNotice.*` |
| REQ-324 | `auth.login.form.*`, `auth.login.validation.*`, `auth.login.errors.*` |
| **REQ-325 (this)** | `auth.signup.form.*`, `auth.signup.validation.*`, `auth.signup.method.*`, `auth.signup.passwordStrength.*`, `auth.signup.terms.*`, `auth.signup.buttons.*` |

The combined namespace after all Auth & Registration tasks provides comprehensive coverage of the complete authentication flow.

---

## References

- [REQ-325 Request Details](../gen_requests_epic2.md#req-325-internationalize-registrationform-component)
- [REQ-324: LoginForm Overview](./REQ-324-update-srccomponentsloginformtsx-overview.md)
- [REQ-323: LoginPageContent Overview](./REQ-323-update-srcapploginloginpagecontenttsx-overview.md)
- [REQ-322: Auth Namespace Structure](./REQ-322-create-auth-namespace-structure-overview.md)
- [Implementation Plan: L10N Epic 2](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Implementation Plan: L10N Epic 1](../prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Sub-Epic 2A: Authentication & Registration](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md#sub-epic-2a-authentication--registration)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A Task 2A.4*
