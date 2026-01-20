# Implementation Breakdown: REQ-E02-042 - Update RegistrationForm Component for Internationalization

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-042
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.4
**Priority:** P1 - High
**Size:** L (Large - Largest file in Auth sub-epic)

---

## Overview

This document provides a detailed implementation breakdown for updating the `RegistrationForm` component (`/src/components/RegistrationForm.tsx`) to support internationalization (i18n) using the next-intl library. This is the largest component in the Authentication & Registration sub-epic with approximately 50+ hardcoded English strings spanning 975 lines of code. All hardcoded English strings must be replaced with translation keys from the `auth.register` namespace to enable multi-language registration form support across all 6 supported languages (English, French, Spanish, German, Dutch, Italian).

---

## Request Summary

### Current Behavior
The `RegistrationForm` component located at `/src/components/RegistrationForm.tsx` contains approximately 50+ hardcoded English strings distributed across:

**Form Field Labels & Placeholders (~15 strings):**
- "Email Address", "Full Name", "Password", "Confirm Password"
- Placeholder texts like "John Doe", "Create a strong password", etc.
- Helper text "(optional)"

**Validation & Error Messages (~15 strings):**
- "Email is required", "Password is required", "Please confirm your password"
- "Password must be at least 8 characters", "Passwords do not match"
- "Name must be at least 2 characters", "Please enter a valid email address"
- "Password must contain at least one lowercase/uppercase letter"
- "You must agree to the terms and conditions"

**Registration Method Selection (~6 strings):**
- "Choose how to create your account"
- "Continue with Google", "Quick sign-up using your Google account"
- "Sign up with email", "Create a password for your account"
- "Enter your details below"

**Password Strength Indicator (~10 strings):**
- "Password strength:", "Enter password"
- "Very Weak", "Weak", "Fair", "Good", "Strong"
- "Requirements:", "At least 8 characters"
- "One lowercase letter", "One uppercase letter", "One number", "One special character"

**Password Match Indicator (~2 strings):**
- "Passwords match", "Passwords do not match"

**Terms & Conditions (~4 strings):**
- "I agree to the", "Terms of Service", "and", "Privacy Policy"

**Submit Button States (~4 strings):**
- "Create Account", "Creating Account...", "Connecting to Google..."

**Helper & Status Messages (~5 strings):**
- "This email is linked to your access code and cannot be changed."
- "Your account will be linked to your verified access code"
- "Access code:", "Registration Failed"

### Expected Behavior
All user-facing strings are externalized to the authentication translation namespace (`auth.register.*`) and rendered using the `useTranslations` hook from next-intl, allowing the registration form to display in any of the six supported languages while maintaining:
- Full form validation functionality
- Password strength calculation and display
- Registration method selection (Google OAuth vs email/password)
- Gmail domain detection and conditional UI display
- Terms and conditions checkbox validation

---

## Technical Context

### Existing Patterns

The codebase has established patterns for internationalization that this implementation should follow:

1. **Translation Hook Usage** (from `LogoutButton.tsx`, `LoginForm.tsx`):
   ```typescript
   import { useTranslations } from 'next-intl';

   const t = useTranslations('auth');
   const tCommon = useTranslations('common');
   const tErrors = useTranslations('errors');
   ```

2. **Translation File Structure** (`/messages/en.json`):
   - `auth` namespace exists with authentication strings
   - `common` namespace exists for shared UI strings
   - `errors` namespace exists for validation error messages

3. **Locale Configuration** (`/src/lib/i18n/config.ts`):
   - Six supported locales: `['en', 'fr', 'es', 'de', 'nl', 'it']`
   - Default locale: `'en'`

4. **Component Pattern**:
   - Client components use `'use client'` directive
   - Translation hooks called at component level
   - Multiple namespace hooks can be used simultaneously

### Dependencies

- **Epic 1 Foundation**: next-intl setup complete (verified)
- **Translation Files**: `/messages/en.json` with `auth` namespace established
- **REQ-E02-039**: `auth` namespace structure (dependency for translation keys)
- **REQ-E02-041**: `LoginForm` internationalization (established pattern to follow)

### Component Complexity Analysis

The `RegistrationForm` component has several unique challenges:

1. **Registration Method State** (REQ-222): Gmail users see method selection radio buttons
2. **Password Strength Calculation**: Independent function that returns translated labels
3. **Validation Function**: Returns error messages that need translation
4. **Conditional UI Display**: Gmail vs non-Gmail email handling
5. **Multiple Form States**: Loading, OAuth loading, OAuth completing
6. **Keyboard Navigation**: Accessible radio button navigation for method selection

---

## Implementation Tasks

### Task 1: Import Translation Hook
**Effort:** XS
**Line:** ~7

**Changes:**
```typescript
// Add to existing imports after line 6
import { useTranslations } from 'next-intl';
```

---

### Task 2: Initialize Translation Hooks
**Effort:** XS
**Lines:** ~62-63

**Description:** Initialize translation hooks for `auth.register` and `errors` namespaces inside the component.

**Changes:**
```typescript
// Add after line 61, inside RegistrationForm component before state declarations
const t = useTranslations('auth.register');
const tErrors = useTranslations('errors');
const tCommon = useTranslations('common');
```

---

### Task 3: Extract Registration Method Options
**Effort:** S
**Lines:** 555-566

**Current Code:**
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

**Translation Keys to Add:**
- `auth.register.method.google.label`: "Continue with Google"
- `auth.register.method.google.description`: "Quick sign-up using your Google account"
- `auth.register.method.emailPassword.label`: "Sign up with email"
- `auth.register.method.emailPassword.description`: "Create a password for your account"

**Refactored Code:**
```typescript
// Move inside component to access translation hook
const getRegistrationMethodOptions = () => [
  {
    id: 'google' as const,
    label: t('method.google.label'),
    description: t('method.google.description')
  },
  {
    id: 'email-password' as const,
    label: t('method.emailPassword.label'),
    description: t('method.emailPassword.description')
  }
];
```

---

### Task 4: Extract Registration Method Selector Strings
**Effort:** S
**Lines:** 569-631

**Current Code:**
```typescript
<label className="block text-sm font-medium text-gray-700">
  Choose how to create your account
</label>
```

**Translation Keys to Add:**
- `auth.register.method.chooseLabel`: "Choose how to create your account"

---

### Task 5: Extract OAuth Section Divider Text
**Effort:** XS
**Lines:** 643-653

**Current Code:**
```typescript
<span className="px-2 bg-white text-gray-500">Enter your details below</span>
```

**Translation Keys to Add:**
- `auth.register.method.detailsDivider`: "Enter your details below"

---

### Task 6: Extract General Error Alert Strings
**Effort:** S
**Lines:** 660-670

**Current Code:**
```typescript
<h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
<p className="mt-1 text-sm text-red-700">{errors.general}</p>
```

**Translation Keys to Add:**
- `auth.register.error.title`: "Registration Failed"

---

### Task 7: Extract Access Code Info Box
**Effort:** S
**Lines:** 673-682

**Current Code:**
```typescript
<p className="text-sm text-green-800">
  Access code: <span className="font-mono font-semibold">{accessCode.substring(0, 4)}...</span>
</p>
```

**Translation Keys to Add:**
- `auth.register.accessCode.label`: "Access code:"

---

### Task 8: Extract Email Field Strings
**Effort:** S
**Lines:** 685-707

**Current Code:**
```typescript
<label htmlFor="email" className="...">Email Address</label>
// ...
placeholder="email@example.com"
// ...
<p className="text-xs text-gray-500 mt-1">
  This email is linked to your access code and cannot be changed.
</p>
```

**Translation Keys to Add:**
- `auth.register.email.label`: "Email Address"
- `auth.register.email.placeholder`: "email@example.com"
- `auth.register.email.linkedHint`: "This email is linked to your access code and cannot be changed."

---

### Task 9: Extract Full Name Field Strings
**Effort:** S
**Lines:** 716-737

**Current Code:**
```typescript
<label htmlFor="fullName" className="...">
  Full Name <span className="text-gray-400">(optional)</span>
</label>
// ...
placeholder="John Doe"
```

**Translation Keys to Add:**
- `auth.register.fullName.label`: "Full Name"
- `auth.register.fullName.optional`: "(optional)"
- `auth.register.fullName.placeholder`: "John Doe"

---

### Task 10: Extract Password Field Strings
**Effort:** S
**Lines:** 743-762

**Current Code:**
```typescript
<label htmlFor="password" className="...">Password</label>
// ...
placeholder="Create a strong password"
```

**Translation Keys to Add:**
- `auth.register.password.label`: "Password"
- `auth.register.password.placeholder`: "Create a strong password"

---

### Task 11: Extract Password Strength Indicator Strings
**Effort:** M
**Lines:** 155-207 (calculatePasswordStrength function), 778-806 (JSX render)

**Current Code (function):**
```typescript
const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const feedback: string[] = [];
// ...
feedback.push('At least 8 characters');
feedback.push('One lowercase letter');
feedback.push('One uppercase letter');
feedback.push('One number');
feedback.push('One special character');
```

**Current Code (JSX):**
```typescript
<span className="text-gray-600">Password strength:</span>
// ...
<p className="text-xs text-gray-600">Requirements:</p>
```

**Translation Keys to Add:**
- `auth.register.password.strength.label`: "Password strength:"
- `auth.register.password.strength.veryWeak`: "Very Weak"
- `auth.register.password.strength.weak`: "Weak"
- `auth.register.password.strength.fair`: "Fair"
- `auth.register.password.strength.good`: "Good"
- `auth.register.password.strength.strong`: "Strong"
- `auth.register.password.strength.enter`: "Enter password"
- `auth.register.password.strength.requirements`: "Requirements:"
- `auth.register.password.strength.minChars`: "At least 8 characters"
- `auth.register.password.strength.lowercase`: "One lowercase letter"
- `auth.register.password.strength.uppercase`: "One uppercase letter"
- `auth.register.password.strength.number`: "One number"
- `auth.register.password.strength.special`: "One special character"

**Refactoring Required:**
The `calculatePasswordStrength` function returns hardcoded strings. Must refactor to return translation keys that are resolved in the render phase:

```typescript
// Return keys instead of strings
const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedbackKeys: [], color: 'gray-300', labelKey: 'enter' };
  }
  // ... rest of logic using keys instead of strings
};
```

---

### Task 12: Extract Confirm Password Field Strings
**Effort:** S
**Lines:** 819-837

**Current Code:**
```typescript
<label htmlFor="confirmPassword" className="...">Confirm Password</label>
// ...
placeholder="Confirm your password"
```

**Translation Keys to Add:**
- `auth.register.confirmPassword.label`: "Confirm Password"
- `auth.register.confirmPassword.placeholder`: "Confirm your password"

---

### Task 13: Extract Password Match Indicator Strings
**Effort:** S
**Lines:** 854-866

**Current Code:**
```typescript
<span className="text-xs text-green-600">Passwords match</span>
// ...
<span className="text-xs text-red-600">Passwords do not match</span>
```

**Translation Keys to Add:**
- `auth.register.confirmPassword.match`: "Passwords match"
- `auth.register.confirmPassword.noMatch`: "Passwords do not match"

---

### Task 14: Extract Terms and Conditions Strings
**Effort:** S
**Lines:** 877-914

**Current Code:**
```typescript
<label htmlFor="agreeToTerms" className="...">
  I agree to the{' '}
  <button type="button" className="...">Terms of Service</button>
  {' '}and{' '}
  <button type="button" className="...">Privacy Policy</button>
</label>
```

**Translation Keys to Add:**
- `auth.register.terms.agreeTo`: "I agree to the"
- `auth.register.terms.termsOfService`: "Terms of Service"
- `auth.register.terms.and`: "and"
- `auth.register.terms.privacyPolicy`: "Privacy Policy"

---

### Task 15: Extract Submit Button Strings
**Effort:** S
**Lines:** 924-965

**Current Code:**
```typescript
// Google OAuth button
<>
  <Loader2 className="w-4 h-4 animate-spin mr-2" />
  Connecting to Google...
</>
// ...
<>
  <img ... />
  Create Account
</>

// Email/password button
<>
  <Loader2 className="w-4 h-4 animate-spin mr-2" />
  Creating Account...
</>
// ...
<>
  <UserPlus className="w-4 h-4 mr-2" />
  Create Account
</>
```

**Translation Keys to Add:**
- `auth.register.button.createAccount`: "Create Account"
- `auth.register.button.creatingAccount`: "Creating Account..."
- `auth.register.button.connectingGoogle`: "Connecting to Google..."

---

### Task 16: Extract Helper Text
**Effort:** XS
**Lines:** 968-972

**Current Code:**
```typescript
<p className="text-sm text-gray-600">
  Your account will be linked to your verified access code
</p>
```

**Translation Keys to Add:**
- `auth.register.helper.linkedToCode`: "Your account will be linked to your verified access code"

---

### Task 17: Extract Validation Error Messages
**Effort:** M
**Lines:** 212-245 (validateField function)

**Current Code:**
```typescript
case 'email':
  if (!value) return 'Email is required';
  if (!emailRegex.test(value as string)) return 'Please enter a valid email address';

case 'password':
  if (!value) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';

case 'confirmPassword':
  if (!value) return 'Please confirm your password';
  if (value !== formData.password) return 'Passwords do not match';

case 'fullName':
  if (value && (value as string).length < 2) return 'Name must be at least 2 characters';

case 'agreeToTerms':
  if (!value) return 'You must agree to the terms and conditions';
```

**Translation Keys to Add (in errors namespace):**
- `errors.form.email.required`: "Email is required"
- `errors.form.email.invalid`: "Please enter a valid email address"
- `errors.form.password.required`: "Password is required"
- `errors.form.password.tooShort`: "Password must be at least 8 characters"
- `errors.form.password.noLowercase`: "Password must contain at least one lowercase letter"
- `errors.form.password.noUppercase`: "Password must contain at least one uppercase letter"
- `errors.form.password.noNumber`: "Password must contain at least one number"
- `errors.form.confirmPassword.required`: "Please confirm your password"
- `errors.form.confirmPassword.mismatch`: "Passwords do not match"
- `errors.form.fullName.tooShort`: "Name must be at least 2 characters"
- `errors.form.terms.required`: "You must agree to the terms and conditions"

**Refactoring Required:**
The `validateField` function runs outside React hook context. Must refactor to return translation keys that are resolved in the render phase:

```typescript
// Return keys instead of strings
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return 'email.required'; // Will be resolved with tErrors
      // ...
  }
};

// In render phase, resolve keys
{errors.email && (
  <p className="text-red-600 text-sm mt-1">{tErrors(`form.${errors.email}`)}</p>
)}
```

---

### Task 18: Update Translation Files
**Effort:** L
**Description:** Add all new translation keys to `/messages/en.json` under the `auth.register` namespace.

**New Keys Structure:**
```json
{
  "auth": {
    "register": {
      "error": {
        "title": "Registration Failed"
      },
      "accessCode": {
        "label": "Access code:"
      },
      "method": {
        "chooseLabel": "Choose how to create your account",
        "detailsDivider": "Enter your details below",
        "google": {
          "label": "Continue with Google",
          "description": "Quick sign-up using your Google account"
        },
        "emailPassword": {
          "label": "Sign up with email",
          "description": "Create a password for your account"
        }
      },
      "email": {
        "label": "Email Address",
        "placeholder": "email@example.com",
        "linkedHint": "This email is linked to your access code and cannot be changed."
      },
      "fullName": {
        "label": "Full Name",
        "optional": "(optional)",
        "placeholder": "John Doe"
      },
      "password": {
        "label": "Password",
        "placeholder": "Create a strong password",
        "strength": {
          "label": "Password strength:",
          "veryWeak": "Very Weak",
          "weak": "Weak",
          "fair": "Fair",
          "good": "Good",
          "strong": "Strong",
          "enter": "Enter password",
          "requirements": "Requirements:",
          "minChars": "At least 8 characters",
          "lowercase": "One lowercase letter",
          "uppercase": "One uppercase letter",
          "number": "One number",
          "special": "One special character"
        }
      },
      "confirmPassword": {
        "label": "Confirm Password",
        "placeholder": "Confirm your password",
        "match": "Passwords match",
        "noMatch": "Passwords do not match"
      },
      "terms": {
        "agreeTo": "I agree to the",
        "termsOfService": "Terms of Service",
        "and": "and",
        "privacyPolicy": "Privacy Policy"
      },
      "button": {
        "createAccount": "Create Account",
        "creatingAccount": "Creating Account...",
        "connectingGoogle": "Connecting to Google..."
      },
      "helper": {
        "linkedToCode": "Your account will be linked to your verified access code"
      }
    }
  },
  "errors": {
    "form": {
      "email": {
        "required": "Email is required",
        "invalid": "Please enter a valid email address"
      },
      "password": {
        "required": "Password is required",
        "tooShort": "Password must be at least 8 characters",
        "noLowercase": "Password must contain at least one lowercase letter",
        "noUppercase": "Password must contain at least one uppercase letter",
        "noNumber": "Password must contain at least one number"
      },
      "confirmPassword": {
        "required": "Please confirm your password",
        "mismatch": "Passwords do not match"
      },
      "fullName": {
        "tooShort": "Name must be at least 2 characters"
      },
      "terms": {
        "required": "You must agree to the terms and conditions"
      }
    }
  }
}
```

---

### Task 19: Visual Regression Testing
**Effort:** M
**Description:** Verify form layout accommodates text length variations across all supported languages.

**Test Cases:**
1. Load registration form in each of the 6 supported languages
2. Verify all labels, buttons, placeholders, and error messages display correctly
3. Check for text overflow or truncation, especially:
   - Password strength labels
   - Registration method selection cards
   - Submit button text
4. Verify form validation messages display in selected language
5. Test language switching while form has validation errors
6. Test password strength indicator in all languages
7. Verify registration method selection works in all languages
8. Test Gmail detection flow maintains functionality

---

## Authorized Files and Functions for Modification

### Primary Component File
| File | Purpose | Modifications Allowed |
|------|---------|----------------------|
| `/src/components/RegistrationForm.tsx` | Registration form component | Add imports, modify all hardcoded strings to use translation hooks, refactor validation function |

### Translation Files
| File | Purpose | Modifications Allowed |
|------|---------|----------------------|
| `/messages/en.json` | English translations | Add new keys under `auth.register` namespace and `errors.form` namespace |
| `/messages/fr.json` | French translations | Add translations (handled by separate translation generation task) |
| `/messages/es.json` | Spanish translations | Add translations (handled by separate translation generation task) |
| `/messages/de.json` | German translations | Add translations (handled by separate translation generation task) |
| `/messages/nl.json` | Dutch translations | Add translations (handled by separate translation generation task) |
| `/messages/it.json` | Italian translations | Add translations (handled by separate translation generation task) |

### Functions to Modify

| Function | Line Numbers | Modification |
|----------|--------------|--------------|
| `RegistrationForm` (component) | 51-973 | Add translation hooks, replace all hardcoded strings |
| `calculatePasswordStrength` | 155-207 | Return translation keys instead of hardcoded strings |
| `validateField` | 212-245 | Return translation keys instead of hardcoded error messages |
| `REGISTRATION_METHOD_OPTIONS` | 555-566 | Convert to function that uses translation hook |

### JSX Sections to Modify

| Section | Line Numbers | String Count |
|---------|--------------|--------------|
| General Error Alert | 660-670 | 1 |
| Access Code Info Box | 673-682 | 1 |
| Registration Method Selector | 569-654 | 6 |
| Email Field | 685-707 | 3 |
| Full Name Field | 712-737 | 3 |
| Password Field | 740-812 | 15 |
| Confirm Password Field | 814-874 | 4 |
| Terms & Conditions | 876-919 | 4 |
| Submit Buttons | 921-965 | 3 |
| Helper Text | 967-972 | 1 |

---

## Implementation Checklist

### Setup
- [ ] Import `useTranslations` hook from next-intl
- [ ] Initialize `t` hook for `auth.register` namespace
- [ ] Initialize `tErrors` hook for `errors` namespace
- [ ] Initialize `tCommon` hook for `common` namespace

### Registration Method Selection (Gmail Users)
- [ ] Refactor `REGISTRATION_METHOD_OPTIONS` to use translations
- [ ] Replace "Choose how to create your account" label
- [ ] Replace "Continue with Google" option label and description
- [ ] Replace "Sign up with email" option label and description
- [ ] Replace "Enter your details below" divider text

### Error Display
- [ ] Replace "Registration Failed" error title

### Access Code Section
- [ ] Replace "Access code:" label

### Email Field
- [ ] Replace "Email Address" label
- [ ] Replace email placeholder text
- [ ] Replace linked email hint text

### Full Name Field
- [ ] Replace "Full Name" label
- [ ] Replace "(optional)" text
- [ ] Replace placeholder text

### Password Field
- [ ] Replace "Password" label
- [ ] Replace password placeholder text
- [ ] Refactor `calculatePasswordStrength` to use translation keys
- [ ] Replace "Password strength:" label
- [ ] Replace all strength level labels (Very Weak to Strong)
- [ ] Replace "Requirements:" heading
- [ ] Replace all requirement feedback messages

### Confirm Password Field
- [ ] Replace "Confirm Password" label
- [ ] Replace confirm password placeholder text
- [ ] Replace "Passwords match" indicator
- [ ] Replace "Passwords do not match" indicator

### Terms & Conditions
- [ ] Replace "I agree to the" text
- [ ] Replace "Terms of Service" link text
- [ ] Replace "and" text
- [ ] Replace "Privacy Policy" link text

### Submit Buttons
- [ ] Replace "Create Account" button text
- [ ] Replace "Creating Account..." loading text
- [ ] Replace "Connecting to Google..." loading text

### Helper Text
- [ ] Replace account link helper text

### Validation
- [ ] Refactor `validateField` to return translation keys
- [ ] Update error display to resolve translation keys
- [ ] Replace all validation error messages

### Translation Files
- [ ] Add all new keys to `/messages/en.json`
- [ ] Verify key structure follows established patterns

### Testing
- [ ] Verify form layout in all 6 supported languages
- [ ] Test password strength indicator in all languages
- [ ] Test registration method selection in all languages
- [ ] Test form validation messages in all languages
- [ ] Ensure form submission flow remains functional
- [ ] Test Gmail detection flow maintains functionality

---

## Dependencies

### Blocking Dependencies
- **REQ-E02-039**: `auth` namespace structure must exist in translation files
- **Epic 1 Foundation**: next-intl setup must be complete

### Non-Blocking Dependencies
- **REQ-E02-032**: `errors` namespace structure (can extend existing structure)
- **REQ-E02-041**: `LoginForm` internationalization (pattern reference, completed)
- Translation generation tasks for other languages (handled separately)

---

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Validation function runs outside React hook context | Medium | High | Return translation keys, resolve in render phase |
| Password strength calculation returns translated strings | Medium | High | Refactor to return keys, resolve during render |
| Longer translations may break form layout | Medium | Medium | Test all languages, use flexible CSS, truncate if needed |
| Error message context lost in translation | Low | Low | Provide detailed comments in translation files |
| Registration flow disruption | High | Low | Thorough testing after implementation |
| Gmail detection logic affected by changes | Medium | Low | Keep detection logic unchanged, only modify display strings |
| Registration method state management affected | Medium | Low | Keep state management unchanged, only modify display strings |

---

## Effort Estimate

| Task Category | Estimated Effort |
|---------------|------------------|
| Hook setup | XS |
| Registration method strings | S |
| Form field strings | M |
| Password strength refactoring | M |
| Validation function refactoring | M |
| Submit button strings | S |
| Translation file updates | L |
| Testing | M |
| **Total** | **L (Large)** |

---

## Acceptance Criteria

From REQ-E02-042:
- [ ] All hardcoded English strings in RegistrationForm are replaced with i18n translation keys
- [ ] Form field labels and placeholders reference auth.register namespace translations
- [ ] Validation error messages are retrieved from errors namespace translations
- [ ] Button text and calls-to-action use translation keys
- [ ] Helper text and instructional content is translatable
- [ ] Error state messages display in the user's language
- [ ] Success confirmation messages are internationalized
- [ ] Component renders correctly when language is switched
- [ ] No English fallback text appears when translations are available
- [ ] Form functionality remains unchanged after internationalization
- [ ] Registration method selection (Google vs email) works correctly
- [ ] Password strength indicator displays in all languages
- [ ] Gmail domain detection flow remains functional
- [ ] Terms and conditions checkbox validation works correctly

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-042
- [Pattern Reference: LoginForm](/docs/REQ-E02-041-update-srccomponentsloginformtsx-overview.md)
- [Pattern Reference: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [Translation File: en.json](/messages/en.json)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A: Authentication & Registration*
*Task 2A.4: Update `/src/components/RegistrationForm.tsx` (largest file)*
