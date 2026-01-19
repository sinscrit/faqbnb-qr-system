# REQ-357: Update RegistrationForm.tsx for Internationalization

**Created:** 2026-01-19 16:30 UTC
**Last Modified:** 2026-01-19 16:30 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.4
**Request Type:** ENHANCEMENT
**Size:** L (Large)
**Priority:** P1 - High

---

## Overview

This document provides the implementation breakdown for internationalizing the `RegistrationForm.tsx` component. This is Task 2A.4 in the L10N Epic 2 implementation plan and is noted as the largest file in the Authentication & Registration sub-epic, containing approximately 50+ user-facing strings that need to be extracted and translated.

The RegistrationForm component handles the complete user registration flow including:
- Email/password registration
- Google OAuth registration for Gmail users
- Password strength validation and feedback
- Terms and conditions agreement
- Registration method selection (Google vs email/password)

This is a critical component for user acquisition and conversion, making proper internationalization essential for international market expansion.

---

## Current State Analysis

### Component Location
`/src/components/RegistrationForm.tsx`

### Component Type
- **Client Component** (`'use client'` directive)
- Uses `useTranslations` hook from `next-intl` (not `getTranslations`)

### Lines of Code
~975 lines (largest component in auth flow)

### Existing Dependencies
```typescript
import { RegistrationResult, UserFriendlyError, OAuthRegistrationRequest } from '@/types';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, UserPlus, Loader2, AlertCircle, Check, Shield } from 'lucide-react';
import { useRegistration } from '@/hooks/useRegistration';
import GoogleOAuthButton from './GoogleOAuthButton';
import { supabase } from '@/lib/supabase';
```

### Component Features
1. **Form Fields:** Email (read-only), Full Name, Password, Confirm Password, Terms checkbox
2. **Password Strength Indicator:** Visual feedback with requirements checklist
3. **Registration Method Selection:** Radio buttons for Gmail users (Google vs email/password)
4. **OAuth Integration:** Google sign-in flow
5. **Validation:** Real-time field validation with error messages
6. **Loading States:** Multiple loading states for different operations

---

## Hardcoded Strings Inventory

### General Error Section
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 665 | `'Registration Failed'` | `auth.register.failed` | Error alert title |

### Access Code Info Section
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 677-678 | `'Access code:'` | `auth.register.accessCodeInfo` | Info badge label |

### Email Field Section
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 686 | `'Email Address'` | `auth.register.emailLabel` | Field label |
| 698 | `'email@example.com'` | `auth.register.emailPlaceholder` | Placeholder |
| 701-702 | `'This email is linked to your access code and cannot be changed.'` | `auth.register.emailLinked` | Helper text |

### Registration Method Selector (Gmail users)
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 571 | `'Choose how to create your account'` | `auth.register.chooseMethod` | Section label |
| 558 | `'Continue with Google'` | `auth.register.googleOption` | Radio option label |
| 559 | `'Quick sign-up using your Google account'` | `auth.register.googleDescription` | Radio option description |
| 563 | `'Sign up with email'` | `auth.register.emailOption` | Radio option label |
| 564 | `'Create a password for your account'` | `auth.register.emailDescription` | Radio option description |
| 650 | `'Enter your details below'` | `auth.register.enterDetails` | Divider text |

### Full Name Field Section
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 717-718 | `'Full Name'` | `auth.register.fullNameLabel` | Field label |
| 718 | `'(optional)'` | `auth.register.fullNameOptional` | Optional indicator |
| 730 | `'John Doe'` | `auth.register.fullNamePlaceholder` | Placeholder |

### Password Field Section
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 744-745 | `'Password'` | `auth.register.passwordLabel` | Field label |
| 758 | `'Create a strong password'` | `auth.register.passwordPlaceholder` | Placeholder |
| 781 | `'Password strength:'` | `auth.register.passwordStrength.label` | Indicator label |
| 794 | `'Requirements:'` | `auth.register.passwordStrength.requirements` | Requirements header |

### Password Strength Labels
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 157 | `'Enter password'` | `auth.register.passwordStrength.enter` | Initial state |
| 199 | `'Very Weak'` | `auth.register.passwordStrength.veryWeak` | Score 0 |
| 199 | `'Weak'` | `auth.register.passwordStrength.weak` | Score 1 |
| 199 | `'Fair'` | `auth.register.passwordStrength.fair` | Score 2 |
| 199 | `'Good'` | `auth.register.passwordStrength.good` | Score 3 |
| 199 | `'Strong'` | `auth.register.passwordStrength.strong` | Score 4 |

### Password Requirements Feedback
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 167 | `'At least 8 characters'` | `auth.register.passwordStrength.minChars` | Requirement |
| 174 | `'One lowercase letter'` | `auth.register.passwordStrength.lowercase` | Requirement |
| 181 | `'One uppercase letter'` | `auth.register.passwordStrength.uppercase` | Requirement |
| 188 | `'One number'` | `auth.register.passwordStrength.number` | Requirement |
| 195 | `'One special character'` | `auth.register.passwordStrength.special` | Requirement |

### Confirm Password Field Section
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 819 | `'Confirm Password'` | `auth.register.confirmPasswordLabel` | Field label |
| 834 | `'Confirm your password'` | `auth.register.confirmPasswordPlaceholder` | Placeholder |
| 859 | `'Passwords match'` | `auth.register.passwordMatch.match` | Match indicator |
| 864 | `'Passwords do not match'` | `auth.register.passwordMatch.noMatch` | No match indicator |

### Terms and Conditions Section
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 891 | `'I agree to the'` | `auth.register.termsLabel` | Label start |
| 896-900 | `'Terms of Service'` | `auth.register.termsOfService` | Link text |
| 903 | `'and'` | `auth.register.and` | Connector |
| 906-910 | `'Privacy Policy'` | `auth.register.privacyPolicy` | Link text |

### Submit Button Section
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 934 | `'Connecting to Google...'` | `auth.register.connectingGoogle` | Google OAuth loading |
| 944 | `'Create Account'` | `auth.register.submitButton` | Button text (Google) |
| 955 | `'Creating Account...'` | `auth.register.creating` | Email loading |
| 961 | `'Create Account'` | `auth.register.submitButton` | Button text (email) |

### Helper Text Section
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 970 | `'Your account will be linked to your verified access code'` | `auth.register.accountLinked` | Footer helper text |

### Validation Error Messages (validateField function)
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 215 | `'Email is required'` | `errors.form.email.required` | Validation |
| 217 | `'Please enter a valid email address'` | `errors.form.email.invalid` | Validation |
| 221 | `'Password is required'` | `errors.form.password.required` | Validation |
| 223 | `'Password must be at least 8 characters'` | `errors.form.password.tooShort` | Validation |
| 224 | `'Password must contain at least one lowercase letter'` | `errors.form.password.lowercase` | Validation |
| 225 | `'Password must contain at least one uppercase letter'` | `errors.form.password.uppercase` | Validation |
| 226 | `'Password must contain at least one number'` | `errors.form.password.number` | Validation |
| 230 | `'Please confirm your password'` | `errors.form.confirmPassword.required` | Validation |
| 231 | `'Passwords do not match'` | `errors.form.confirmPassword.mismatch` | Validation |
| 235 | `'Name must be at least 2 characters'` | `errors.form.fullName.tooShort` | Validation |
| 239 | `'You must agree to the terms and conditions'` | `errors.form.agreeToTerms.required` | Validation |

### Error Messages (submission/OAuth)
| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 459 | `'OAuth registration failed'` | `errors.auth.oauthFailed` | OAuth error |
| 542 | `'Registration failed'` | `errors.auth.registrationFailed` | General error |
| 548 | `'An unexpected error occurred during registration'` | `errors.auth.unexpectedError` | Catch-all error |

---

## Implementation Approach

### Pattern Reference
Follow the pattern established in `LogoutButton.tsx`:
```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('auth.register');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');

  return <h1>{t('title')}</h1>;
}
```

### Translation Namespace Structure

The `auth.register` namespace in `/messages/en.json` needs the following structure:

```json
{
  "auth": {
    "register": {
      "title": "Create your account",
      "subtitle": "Join FAQBNB and start managing your properties",
      "failed": "Registration Failed",
      "accessCodeInfo": "Access code:",
      "emailLabel": "Email Address",
      "emailPlaceholder": "email@example.com",
      "emailLinked": "This email is linked to your access code and cannot be changed.",
      "chooseMethod": "Choose how to create your account",
      "googleOption": "Continue with Google",
      "googleDescription": "Quick sign-up using your Google account",
      "emailOption": "Sign up with email",
      "emailDescription": "Create a password for your account",
      "enterDetails": "Enter your details below",
      "fullNameLabel": "Full Name",
      "fullNameOptional": "(optional)",
      "fullNamePlaceholder": "John Doe",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Create a strong password",
      "confirmPasswordLabel": "Confirm Password",
      "confirmPasswordPlaceholder": "Confirm your password",
      "termsLabel": "I agree to the",
      "termsOfService": "Terms of Service",
      "and": "and",
      "privacyPolicy": "Privacy Policy",
      "submitButton": "Create Account",
      "creating": "Creating Account...",
      "connectingGoogle": "Connecting to Google...",
      "accountLinked": "Your account will be linked to your verified access code",
      "passwordStrength": {
        "label": "Password strength:",
        "enter": "Enter password",
        "veryWeak": "Very Weak",
        "weak": "Weak",
        "fair": "Fair",
        "good": "Good",
        "strong": "Strong",
        "requirements": "Requirements:",
        "minChars": "At least 8 characters",
        "lowercase": "One lowercase letter",
        "uppercase": "One uppercase letter",
        "number": "One number",
        "special": "One special character"
      },
      "passwordMatch": {
        "match": "Passwords match",
        "noMatch": "Passwords do not match"
      }
    }
  }
}
```

### Error Namespace Additions

Add to the `errors` namespace in `/messages/en.json`:

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
        "tooShort": "Password must be at least 8 characters",
        "lowercase": "Password must contain at least one lowercase letter",
        "uppercase": "Password must contain at least one uppercase letter",
        "number": "Password must contain at least one number"
      },
      "confirmPassword": {
        "required": "Please confirm your password",
        "mismatch": "Passwords do not match"
      },
      "fullName": {
        "tooShort": "Name must be at least 2 characters"
      },
      "agreeToTerms": {
        "required": "You must agree to the terms and conditions"
      }
    },
    "auth": {
      "oauthFailed": "OAuth registration failed",
      "registrationFailed": "Registration failed",
      "unexpectedError": "An unexpected error occurred during registration"
    }
  }
}
```

---

## Authorized Files and Functions for Modification

### Primary File
| File Path | Modification Scope |
|-----------|-------------------|
| `/src/components/RegistrationForm.tsx` | Add imports, replace all hardcoded strings with `t()` calls |

### Translation Files
| File Path | Modification Scope |
|-----------|-------------------|
| `/messages/en.json` | Add/update `auth.register` namespace entries, add `errors.form` and `errors.auth` entries |
| `/messages/fr.json` | Add French translations for new entries |
| `/messages/es.json` | Add Spanish translations for new entries |
| `/messages/de.json` | Add German translations for new entries |
| `/messages/nl.json` | Add Dutch translations for new entries |
| `/messages/it.json` | Add Italian translations for new entries |

### Functions to Modify
| Function/Component | Location | Changes |
|-------------------|----------|---------|
| `RegistrationForm` | Line 51-973 | Add `useTranslations` hooks, replace strings |
| `calculatePasswordStrength` | Lines 155-207 | Update feedback array and labels to use translations |
| `validateField` | Lines 212-245 | Replace hardcoded error messages with `t()` calls |
| `registrationMethodSelector` | Lines 569-631 | Replace all label and description text |
| `oauthSection` | Lines 634-655 | Replace divider text |
| Form render section | Lines 657-973 | Replace all UI text with translations |

### Inner Variables to Update
| Variable | Location | Changes |
|----------|----------|---------|
| `REGISTRATION_METHOD_OPTIONS` | Lines 555-566 | Labels and descriptions need translation |

---

## Implementation Tasks

### Task 1: Update Translation Files
**Estimate:** Medium
**Description:** Add all required translation keys to all 6 language files.

**Steps:**
1. Open `/messages/en.json`
2. Add the `auth.register` namespace with all identified strings
3. Add the `errors.form` and `errors.auth` entries
4. Copy structure to other 5 language files and translate

### Task 2: Add useTranslations Imports
**Estimate:** Trivial
**Description:** Add the next-intl import to RegistrationForm.tsx.

**Code Change:**
```typescript
// Add to existing imports (after line 6)
import { useTranslations } from 'next-intl';
```

### Task 3: Initialize Translation Hooks
**Estimate:** Trivial
**Description:** Add translation hook initialization inside the component.

**Code Change (inside component function, after line 73):**
```typescript
const t = useTranslations('auth.register');
const tErrors = useTranslations('errors');
const tCommon = useTranslations('common');
```

### Task 4: Update calculatePasswordStrength Function
**Estimate:** Medium
**Description:** Replace hardcoded feedback strings and labels.

**Location:** Lines 155-207

**Note:** This function needs to receive `t` as a parameter or be moved inside the component body to access translations. Recommended approach: Pass translations as parameter.

**Before:**
```typescript
const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedback: [], color: 'gray-300', label: 'Enter password' };
  }
  // ...
  feedback.push('At least 8 characters');
  // ...
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
```

**After:**
```typescript
// Move inside component or pass t as parameter
const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedback: [], color: 'gray-300', label: t('passwordStrength.enter') };
  }
  // ...
  feedback.push(t('passwordStrength.minChars'));
  // ...
  const labels = [
    t('passwordStrength.veryWeak'),
    t('passwordStrength.weak'),
    t('passwordStrength.fair'),
    t('passwordStrength.good'),
    t('passwordStrength.strong')
  ];
```

### Task 5: Update validateField Function
**Estimate:** Medium
**Description:** Replace all hardcoded validation error messages.

**Location:** Lines 212-245

**Before:**
```typescript
case 'email':
  if (!value) return 'Email is required';
  // ...
  if (!emailRegex.test(value as string)) return 'Please enter a valid email address';
```

**After:**
```typescript
case 'email':
  if (!value) return tErrors('form.email.required');
  // ...
  if (!emailRegex.test(value as string)) return tErrors('form.email.invalid');
```

### Task 6: Update REGISTRATION_METHOD_OPTIONS
**Estimate:** Small
**Description:** Replace static option labels and descriptions.

**Location:** Lines 555-566

**Note:** This const is defined outside the component. Move inside component or make dynamic.

**After (inside component):**
```typescript
const registrationMethodOptions = [
  {
    id: 'google' as const,
    label: t('googleOption'),
    description: t('googleDescription')
  },
  {
    id: 'email-password' as const,
    label: t('emailOption'),
    description: t('emailDescription')
  }
];
```

### Task 7: Update General Error Alert
**Estimate:** Trivial
**Description:** Replace error title text.

**Location:** Lines 660-670

**Before:**
```tsx
<h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
```

**After:**
```tsx
<h3 className="text-sm font-medium text-red-800">{t('failed')}</h3>
```

### Task 8: Update Access Code Info
**Estimate:** Trivial
**Description:** Replace access code label.

**Location:** Lines 673-682

**Before:**
```tsx
<p className="text-sm text-green-800">
  Access code: <span className="font-mono font-semibold">...</span>
</p>
```

**After:**
```tsx
<p className="text-sm text-green-800">
  {t('accessCodeInfo')} <span className="font-mono font-semibold">...</span>
</p>
```

### Task 9: Update Email Field
**Estimate:** Small
**Description:** Replace email field label, placeholder, and helper text.

**Location:** Lines 684-707

**Changes:**
- Line 686: Label → `{t('emailLabel')}`
- Line 698: placeholder → `placeholder={t('emailPlaceholder')}`
- Lines 701-702: Helper text → `{t('emailLinked')}`

### Task 10: Update Registration Method Selector
**Estimate:** Medium
**Description:** Replace section label and divider text in oauthSection.

**Location:** Lines 569-655

**Changes:**
- Line 571: `{t('chooseMethod')}`
- Line 650: `{t('enterDetails')}`

### Task 11: Update Full Name Field
**Estimate:** Small
**Description:** Replace label, optional indicator, and placeholder.

**Location:** Lines 713-737

**Changes:**
- Line 717: `{t('fullNameLabel')}`
- Line 718: `{t('fullNameOptional')}`
- Line 730: `placeholder={t('fullNamePlaceholder')}`

### Task 12: Update Password Field
**Estimate:** Medium
**Description:** Replace label, placeholder, and strength indicator.

**Location:** Lines 740-811

**Changes:**
- Line 744-745: `{t('passwordLabel')}`
- Line 758: `placeholder={t('passwordPlaceholder')}`
- Line 781: `{t('passwordStrength.label')}`
- Line 794: `{t('passwordStrength.requirements')}`

### Task 13: Update Confirm Password Field
**Estimate:** Small
**Description:** Replace label, placeholder, and match indicators.

**Location:** Lines 814-874

**Changes:**
- Line 819: `{t('confirmPasswordLabel')}`
- Line 834: `placeholder={t('confirmPasswordPlaceholder')}`
- Line 859: `{t('passwordMatch.match')}`
- Line 864: `{t('passwordMatch.noMatch')}`

### Task 14: Update Terms and Conditions
**Estimate:** Small
**Description:** Replace terms text and link labels.

**Location:** Lines 876-919

**Changes:**
- Line 891: `{t('termsLabel')}`
- Lines 896-900: `{t('termsOfService')}`
- Line 903: `{t('and')}`
- Lines 906-910: `{t('privacyPolicy')}`

### Task 15: Update Submit Buttons
**Estimate:** Medium
**Description:** Replace button text and loading states for both Google and email registration.

**Location:** Lines 924-965

**Changes:**
- Line 934: `{t('connectingGoogle')}`
- Line 944: `{t('submitButton')}`
- Line 955: `{t('creating')}`
- Line 961: `{t('submitButton')}`

### Task 16: Update Helper Text
**Estimate:** Trivial
**Description:** Replace footer helper text.

**Location:** Lines 968-972

**Before:**
```tsx
<p className="text-sm text-gray-600">
  Your account will be linked to your verified access code
</p>
```

**After:**
```tsx
<p className="text-sm text-gray-600">
  {t('accountLinked')}
</p>
```

### Task 17: Update Error Messages in Handlers
**Estimate:** Small
**Description:** Replace hardcoded error messages in OAuth and form submission handlers.

**Location:** Lines 459, 542, 548

**Changes:**
- Line 459: `tErrors('auth.oauthFailed')`
- Line 542: `tErrors('auth.registrationFailed')`
- Line 548: `tErrors('auth.unexpectedError')`

---

## Dependencies

### Required Before Implementation
- [x] Epic 1 Foundation complete (next-intl installed, IntlProvider configured)
- [ ] Task 2A.1: Create `auth` namespace structure (should be complete or done in parallel)

### Components This Affects
- None directly - RegistrationForm is used as a child component

### Components That Use This
- `/src/app/register/page.tsx` - Uses RegistrationForm component
- `/src/app/register/complete/page.tsx` - Uses RegistrationForm component

---

## Testing Requirements

### Manual Testing Checklist
- [ ] Form loads without errors in English (default)
- [ ] All field labels display correctly in each of the 6 languages
- [ ] All placeholder text displays correctly in each language
- [ ] Registration method selector labels appear translated for Gmail users
- [ ] Password strength indicator shows translated feedback
- [ ] Password requirements checklist shows translated items
- [ ] Password match/no-match indicators are translated
- [ ] Terms and conditions text is translated with working links
- [ ] Submit button shows translated text in both states (idle and loading)
- [ ] Google OAuth button shows translated loading text
- [ ] Helper text at bottom is translated
- [ ] Validation error messages appear in selected language
- [ ] Form submission error messages are translated
- [ ] No console errors related to missing translations
- [ ] Layout does not break with longer translated strings (especially German)

### Form Validation Testing
- [ ] Required email validation message is translated
- [ ] Invalid email validation message is translated
- [ ] Required password validation message is translated
- [ ] Password too short validation message is translated
- [ ] Password missing lowercase validation is translated
- [ ] Password missing uppercase validation is translated
- [ ] Password missing number validation is translated
- [ ] Confirm password required validation is translated
- [ ] Passwords don't match validation is translated
- [ ] Name too short validation is translated
- [ ] Terms agreement required validation is translated

### OAuth Flow Testing
- [ ] Google sign-in loading state shows translated text
- [ ] OAuth errors display translated messages

### Accessibility Verification
- [ ] Form labels properly associated with inputs
- [ ] Error messages announced by screen readers
- [ ] All interactive elements maintain proper ARIA labels
- [ ] Password visibility toggle maintains accessibility

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys | Low | Medium | Build-time check with next-intl |
| Text overflow in longer languages | High | Medium | German ~30% longer - test layout thoroughly |
| Password strength function scope | Medium | High | Carefully refactor to access translations |
| Breaking existing tests | Medium | Medium | Update any snapshot tests |
| Registration flow regression | Low | Critical | Test complete flow in all languages |
| Validation message timing | Low | Low | Ensure translations don't affect validation timing |

---

## Acceptance Criteria Verification

| Criterion | Implementation Task |
|-----------|---------------------|
| All form field labels appear in selected language | Tasks 9, 11, 12, 13 |
| All placeholder text reflects selected language | Tasks 9, 11, 12, 13 |
| All validation error messages display in selected language | Task 5, 17 |
| Button text and loading states appear in selected language | Task 15 |
| Password strength indicators show in selected language | Tasks 4, 12 |
| Registration method selection labels appear in selected language | Tasks 6, 10 |
| OAuth flow messages display in selected language | Tasks 15, 17 |
| Terms and conditions text appears in selected language | Task 14 |
| Help text and informational messages show in selected language | Tasks 8, 16 |
| Error messages from form submission appear in selected language | Task 17 |
| All conditional UI text based on email domain displays in selected language | Tasks 6, 10 |
| Success and confirmation messages appear in selected language | Task 17 |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-357)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [i18n Configuration](/src/lib/i18n/config.ts)

---

## Appendix: Complete String Extraction Map

```
RegistrationForm.tsx String Extraction (~50+ strings)

┌─────────────────────────────────────────────────────────────────────┐
│ IMPORTS & HOOK INITIALIZATION                                        │
├─────────────────────────────────────────────────────────────────────┤
│ • Add: import { useTranslations } from 'next-intl';                 │
│ • Add: const t = useTranslations('auth.register');                  │
│ • Add: const tErrors = useTranslations('errors');                   │
│ • Add: const tCommon = useTranslations('common');                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASSWORD STRENGTH (lines 155-207)                                    │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Enter password'        → t('passwordStrength.enter')             │
│ • 'At least 8 characters' → t('passwordStrength.minChars')          │
│ • 'One lowercase letter'  → t('passwordStrength.lowercase')         │
│ • 'One uppercase letter'  → t('passwordStrength.uppercase')         │
│ • 'One number'            → t('passwordStrength.number')            │
│ • 'One special character' → t('passwordStrength.special')           │
│ • 'Very Weak'             → t('passwordStrength.veryWeak')          │
│ • 'Weak'                  → t('passwordStrength.weak')              │
│ • 'Fair'                  → t('passwordStrength.fair')              │
│ • 'Good'                  → t('passwordStrength.good')              │
│ • 'Strong'                → t('passwordStrength.strong')            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ VALIDATION MESSAGES (lines 212-245)                                  │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Email is required'     → tErrors('form.email.required')          │
│ • 'Please enter valid...' → tErrors('form.email.invalid')           │
│ • 'Password is required'  → tErrors('form.password.required')       │
│ • 'Password must be 8...' → tErrors('form.password.tooShort')       │
│ • 'Password lowercase...' → tErrors('form.password.lowercase')      │
│ • 'Password uppercase...' → tErrors('form.password.uppercase')      │
│ • 'Password number...'    → tErrors('form.password.number')         │
│ • 'Please confirm...'     → tErrors('form.confirmPassword.required')│
│ • 'Passwords do not...'   → tErrors('form.confirmPassword.mismatch')│
│ • 'Name must be at...'    → tErrors('form.fullName.tooShort')       │
│ • 'You must agree...'     → tErrors('form.agreeToTerms.required')   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ REGISTRATION METHOD OPTIONS (lines 555-566)                          │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Continue with Google'  → t('googleOption')                       │
│ • 'Quick sign-up...'      → t('googleDescription')                  │
│ • 'Sign up with email'    → t('emailOption')                        │
│ • 'Create a password...'  → t('emailDescription')                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ METHOD SELECTOR SECTION (lines 569-655)                              │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Choose how to create...' → t('chooseMethod')                     │
│ • 'Enter your details...'   → t('enterDetails')                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ERROR ALERT (lines 660-670)                                          │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Registration Failed'   → t('failed')                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ACCESS CODE INFO (lines 673-682)                                     │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Access code:'          → t('accessCodeInfo')                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ EMAIL FIELD (lines 684-707)                                          │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Email Address'         → t('emailLabel')                         │
│ • 'email@example.com'     → t('emailPlaceholder')                   │
│ • 'This email is linked...' → t('emailLinked')                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ FULL NAME FIELD (lines 713-737)                                      │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Full Name'             → t('fullNameLabel')                      │
│ • '(optional)'            → t('fullNameOptional')                   │
│ • 'John Doe'              → t('fullNamePlaceholder')                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PASSWORD FIELD (lines 740-811)                                       │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Password'              → t('passwordLabel')                      │
│ • 'Create a strong...'    → t('passwordPlaceholder')                │
│ • 'Password strength:'    → t('passwordStrength.label')             │
│ • 'Requirements:'         → t('passwordStrength.requirements')      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ CONFIRM PASSWORD FIELD (lines 814-874)                               │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Confirm Password'      → t('confirmPasswordLabel')               │
│ • 'Confirm your password' → t('confirmPasswordPlaceholder')         │
│ • 'Passwords match'       → t('passwordMatch.match')                │
│ • 'Passwords do not...'   → t('passwordMatch.noMatch')              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ TERMS AND CONDITIONS (lines 876-919)                                 │
├─────────────────────────────────────────────────────────────────────┤
│ • 'I agree to the'        → t('termsLabel')                         │
│ • 'Terms of Service'      → t('termsOfService')                     │
│ • 'and'                   → t('and')                                │
│ • 'Privacy Policy'        → t('privacyPolicy')                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ SUBMIT BUTTONS (lines 924-965)                                       │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Connecting to Google...' → t('connectingGoogle')                 │
│ • 'Create Account'        → t('submitButton')                       │
│ • 'Creating Account...'   → t('creating')                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ HELPER TEXT (lines 968-972)                                          │
├─────────────────────────────────────────────────────────────────────┤
│ • 'Your account will...'  → t('accountLinked')                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ERROR HANDLERS (lines 459, 542, 548)                                 │
├─────────────────────────────────────────────────────────────────────┤
│ • 'OAuth registration...' → tErrors('auth.oauthFailed')             │
│ • 'Registration failed'   → tErrors('auth.registrationFailed')      │
│ • 'An unexpected error...'→ tErrors('auth.unexpectedError')         │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Document generated for FAQBNB L10N Epic 2 - Task 2A.4*
