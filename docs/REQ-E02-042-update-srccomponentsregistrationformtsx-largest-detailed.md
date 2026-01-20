# Detailed Task Breakdown: REQ-E02-042 - Update RegistrationForm Component for Internationalization

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-042
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.4
**Priority:** P1 - High
**Size:** L (Large - Largest file in Auth sub-epic)
**Estimated Story Points:** 8

---

## Overview

This document provides granular, actionable implementation tasks for updating the `RegistrationForm` component (`/src/components/RegistrationForm.tsx`) to support internationalization (i18n). The component contains approximately 50+ hardcoded English strings across 975 lines of code. This breakdown enables an AI coding agent or junior developer to implement the changes step-by-step.

---

## Reference Documents

- **Overview Document:** [REQ-E02-042-update-srccomponentsregistrationformtsx-largest-overview.md](/docs/REQ-E02-042-update-srccomponentsregistrationformtsx-largest-overview.md)
- **Request Document:** [gen_requests_epic2.md](/docs/gen_requests_epic2.md) - REQ-E02-042
- **Implementation Plan:** [Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- **Target Component:** `/src/components/RegistrationForm.tsx`
- **Translation File:** `/messages/en.json`

---

## Prerequisites

Before starting implementation, verify:
- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] `auth` namespace exists in `/messages/en.json`
- [ ] `errors` namespace exists in `/messages/en.json`
- [ ] REQ-E02-039 (auth namespace structure) is complete or can be extended

---

## Task Breakdown

### TASK 1: Add Translation Hook Import
**Size:** XS (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Line:** ~7

**Description:** Import the `useTranslations` hook from next-intl at the top of the file.

**Implementation Steps:**
1. Open `/src/components/RegistrationForm.tsx`
2. Locate the imports section (lines 1-9)
3. Add the useTranslations import after the existing React imports

**Code Change:**
```typescript
// Add after line 6, near the icon imports
import { useTranslations } from 'next-intl';
```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] Import is placed with other external library imports

---

### TASK 2: Initialize Translation Hooks in Component
**Size:** XS (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** Insert after line 61

**Description:** Initialize three translation hooks inside the component for different namespaces: `auth.register`, `errors`, and `common`.

**Implementation Steps:**
1. Locate the component function start (line 51: `export default function RegistrationForm`)
2. Find the first hook call (line 62: `const [formData, setFormData]`)
3. Insert translation hooks before the state declarations

**Code Change:**
```typescript
// Add after line 61, inside RegistrationForm component
const t = useTranslations('auth.register');
const tErrors = useTranslations('errors.form');
const tCommon = useTranslations('common');
```

**Verification:**
- [ ] Component renders without errors
- [ ] All three hooks are initialized
- [ ] Hooks are called at component level (not inside callbacks)

---

### TASK 3: Add Translation Keys to en.json - auth.register Namespace
**Size:** M (2 Story Points)
**File:** `/messages/en.json`

**Description:** Add all registration form translation keys to the English translation file under a new `auth.register` nested namespace.

**Implementation Steps:**
1. Open `/messages/en.json`
2. Locate the `auth` namespace (line 37)
3. Add a new `register` sub-object with all required keys

**Code Change - Add to auth namespace:**
```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    ... existing keys ...
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
  }
}
```

**Verification:**
- [ ] JSON is valid (no syntax errors)
- [ ] All keys are properly nested under `auth.register`
- [ ] Key names follow the `namespace.component.element.variant` convention

---

### TASK 4: Add Translation Keys to en.json - errors.form Namespace
**Size:** S (1 Story Point)
**File:** `/messages/en.json`

**Description:** Add form validation error messages to the errors namespace.

**Implementation Steps:**
1. Open `/messages/en.json`
2. Locate the `errors` namespace (line 103)
3. Add a new `form` sub-object with validation error keys

**Code Change - Add to errors namespace:**
```json
{
  "errors": {
    ... existing keys ...,
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

**Verification:**
- [ ] JSON is valid
- [ ] All validation error keys are added
- [ ] Keys are nested under `errors.form`

---

### TASK 5: Refactor PasswordStrength Interface
**Size:** S (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 41-46

**Description:** Update the PasswordStrength interface to use translation keys instead of direct strings.

**Implementation Steps:**
1. Locate the PasswordStrength interface (lines 41-46)
2. Change `feedback: string[]` to `feedbackKeys: string[]`
3. Change `label: string` to `labelKey: string`

**Code Change:**
```typescript
interface PasswordStrength {
  score: number; // 0-4
  feedbackKeys: string[]; // Changed from feedback
  color: string;
  labelKey: string; // Changed from label
}
```

**Verification:**
- [ ] Interface compiles without errors
- [ ] Property names clearly indicate they hold keys, not values

---

### TASK 6: Refactor calculatePasswordStrength Function
**Size:** M (2 Story Points)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 155-207

**Description:** Update the password strength calculation to return translation keys instead of hardcoded strings.

**Implementation Steps:**
1. Locate the calculatePasswordStrength function (line 155)
2. Replace hardcoded strings with translation key identifiers
3. Update the labels array to use key suffixes
4. Update the feedback array to push key suffixes

**Code Change:**
```typescript
// Password strength calculation
const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedbackKeys: [], color: 'gray-300', labelKey: 'enter' };
  }

  let score = 0;
  const feedbackKeys: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedbackKeys.push('minChars');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedbackKeys.push('lowercase');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedbackKeys.push('uppercase');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedbackKeys.push('number');
  }

  // Special character check
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedbackKeys.push('special');
  }

  const colors = ['red-300', 'red-400', 'yellow-400', 'blue-400', 'green-400'];
  const labelKeys = ['veryWeak', 'weak', 'fair', 'good', 'strong'];

  return {
    score: Math.min(score, 4),
    feedbackKeys,
    color: colors[Math.min(score, 4)],
    labelKey: labelKeys[Math.min(score, 4)]
  };
};
```

**Verification:**
- [ ] Function returns keys instead of strings
- [ ] All five feedback messages converted to keys
- [ ] All five strength labels converted to keys

---

### TASK 7: Refactor validateField Function to Return Error Keys
**Size:** M (2 Story Points)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 212-245

**Description:** Update the validation function to return translation keys that will be resolved during render.

**Implementation Steps:**
1. Locate the validateField function (line 212)
2. Replace all hardcoded error messages with error key identifiers
3. Update return values to be keys instead of full messages

**Code Change:**
```typescript
// Validate individual fields - returns error keys, not full messages
const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
  switch (name) {
    case 'email':
      if (!value) return 'email.required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) return 'email.invalid';
      return undefined;

    case 'password':
      if (!value) return 'password.required';
      const password = value as string;
      if (password.length < 8) return 'password.tooShort';
      if (!/[a-z]/.test(password)) return 'password.noLowercase';
      if (!/[A-Z]/.test(password)) return 'password.noUppercase';
      if (!/\d/.test(password)) return 'password.noNumber';
      return undefined;

    case 'confirmPassword':
      if (!value) return 'confirmPassword.required';
      if (value !== formData.password) return 'confirmPassword.mismatch';
      return undefined;

    case 'fullName':
      if (value && (value as string).length < 2) return 'fullName.tooShort';
      return undefined;

    case 'agreeToTerms':
      if (!value) return 'terms.required';
      return undefined;

    default:
      return undefined;
  }
};
```

**Verification:**
- [ ] All validation messages replaced with keys
- [ ] Keys match the structure in errors.form namespace
- [ ] Function still returns undefined for valid fields

---

### TASK 8: Convert REGISTRATION_METHOD_OPTIONS to Use Translations
**Size:** S (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 555-566

**Description:** Move the registration method options inside the component and use translation hooks.

**Implementation Steps:**
1. Locate REGISTRATION_METHOD_OPTIONS (line 555)
2. Convert it to a function that uses the translation hook
3. Call the function where the options are needed

**Code Change:**
```typescript
// REQ-222: Registration method options for Gmail users - now using translations
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

**Note:** Update references from `REGISTRATION_METHOD_OPTIONS` to `getRegistrationMethodOptions()` at line 579.

**Verification:**
- [ ] Options are now functions of the translation hook
- [ ] All references updated to call the function

---

### TASK 9: Replace Registration Method Selector Strings
**Size:** S (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 569-631

**Description:** Replace hardcoded strings in the registration method selector with translation calls.

**Implementation Steps:**
1. Locate the registrationMethodSelector JSX (line 569)
2. Replace "Choose how to create your account" at line 572
3. Update the map to use getRegistrationMethodOptions()

**Code Changes:**

Line 571-573:
```tsx
<label className="block text-sm font-medium text-gray-700">
  {t('method.chooseLabel')}
</label>
```

Line 579:
```tsx
{getRegistrationMethodOptions().map((option) => (
```

**Verification:**
- [ ] Label uses translation
- [ ] Options come from translated function

---

### TASK 10: Replace OAuth Section Divider Text
**Size:** XS (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 643-653

**Description:** Replace "Enter your details below" with translation.

**Implementation Steps:**
1. Locate the divider span at line 650
2. Replace hardcoded text with translation call

**Code Change:**
```tsx
<span className="px-2 bg-white text-gray-500">{t('method.detailsDivider')}</span>
```

**Verification:**
- [ ] Divider text uses translation

---

### TASK 11: Replace General Error Alert Title
**Size:** XS (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 660-670

**Description:** Replace "Registration Failed" error title with translation.

**Implementation Steps:**
1. Locate the error alert h3 at line 665
2. Replace hardcoded text with translation call

**Code Change:**
```tsx
<h3 className="text-sm font-medium text-red-800">{t('error.title')}</h3>
```

**Verification:**
- [ ] Error title uses translation

---

### TASK 12: Replace Access Code Label
**Size:** XS (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 673-682

**Description:** Replace "Access code:" label with translation.

**Implementation Steps:**
1. Locate the access code paragraph at line 677-678
2. Replace hardcoded text with translation call

**Code Change:**
```tsx
<p className="text-sm text-green-800">
  {t('accessCode.label')} <span className="font-mono font-semibold">{accessCode.substring(0, 4)}...</span>
</p>
```

**Verification:**
- [ ] Access code label uses translation

---

### TASK 13: Replace Email Field Strings
**Size:** S (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 685-707

**Description:** Replace all email field hardcoded strings with translations.

**Implementation Steps:**
1. Replace "Email Address" label at line 687
2. Replace placeholder at line 697
3. Replace hint text at line 701-702

**Code Changes:**

Line 686-688:
```tsx
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
  {t('email.label')}
</label>
```

Line 697:
```tsx
placeholder={t('email.placeholder')}
```

Lines 701-703:
```tsx
<p className="text-xs text-gray-500 mt-1">
  {t('email.linkedHint')}
</p>
```

**Verification:**
- [ ] All three email field strings use translations

---

### TASK 14: Replace Full Name Field Strings
**Size:** S (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 716-737

**Description:** Replace full name field hardcoded strings with translations.

**Implementation Steps:**
1. Replace "Full Name" and "(optional)" at lines 717-718
2. Replace placeholder at line 730

**Code Changes:**

Lines 717-719:
```tsx
<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
  {t('fullName.label')} <span className="text-gray-400">{t('fullName.optional')}</span>
</label>
```

Line 730:
```tsx
placeholder={t('fullName.placeholder')}
```

**Verification:**
- [ ] Label, optional text, and placeholder use translations

---

### TASK 15: Replace Password Field Strings
**Size:** S (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 743-762

**Description:** Replace password field label and placeholder with translations.

**Implementation Steps:**
1. Replace "Password" label at line 744-745
2. Replace placeholder at line 758

**Code Changes:**

Lines 744-746:
```tsx
<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
  {t('password.label')}
</label>
```

Line 758:
```tsx
placeholder={t('password.placeholder')}
```

**Verification:**
- [ ] Label and placeholder use translations

---

### TASK 16: Replace Password Strength Indicator Strings
**Size:** M (2 Story Points)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 778-806

**Description:** Update the password strength indicator to use translated labels and feedback.

**Implementation Steps:**
1. Replace "Password strength:" at line 781
2. Update strength label display to use translation with key
3. Replace "Requirements:" at line 794
4. Update feedback list to translate each key

**Code Changes:**

Lines 780-785:
```tsx
<div className="flex items-center justify-between text-xs">
  <span className="text-gray-600">{t('password.strength.label')}</span>
  <span className={`font-medium text-${passwordStrength.color.replace('-300', '-600').replace('-400', '-600')}`}>
    {t(`password.strength.${passwordStrength.labelKey}`)}
  </span>
</div>
```

Lines 793-805:
```tsx
{passwordStrength.feedbackKeys.length > 0 && (
  <div className="mt-1">
    <p className="text-xs text-gray-600">{t('password.strength.requirements')}</p>
    <ul className="text-xs text-gray-500 space-y-0.5">
      {passwordStrength.feedbackKeys.map((key, index) => (
        <li key={index} className="flex items-center">
          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
          {t(`password.strength.${key}`)}
        </li>
      ))}
    </ul>
  </div>
)}
```

**Verification:**
- [ ] Strength label uses translated key lookup
- [ ] Requirements heading uses translation
- [ ] Each feedback item is translated via key lookup

---

### TASK 17: Replace Confirm Password Field Strings
**Size:** S (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 819-837

**Description:** Replace confirm password field label and placeholder with translations.

**Implementation Steps:**
1. Replace "Confirm Password" label at line 819-820
2. Replace placeholder at line 834

**Code Changes:**

Lines 819-821:
```tsx
<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
  {t('confirmPassword.label')}
</label>
```

Line 834:
```tsx
placeholder={t('confirmPassword.placeholder')}
```

**Verification:**
- [ ] Label and placeholder use translations

---

### TASK 18: Replace Password Match Indicator Strings
**Size:** S (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 854-866

**Description:** Replace password match indicator messages with translations.

**Implementation Steps:**
1. Replace "Passwords match" at line 859
2. Replace "Passwords do not match" at line 864

**Code Changes:**

Lines 856-867:
```tsx
{formData.confirmPassword && (
  <div className="mt-1 flex items-center">
    {formData.password === formData.confirmPassword ? (
      <>
        <Check className="h-3 w-3 text-green-600 mr-1" />
        <span className="text-xs text-green-600">{t('confirmPassword.match')}</span>
      </>
    ) : (
      <>
        <AlertCircle className="h-3 w-3 text-red-600 mr-1" />
        <span className="text-xs text-red-600">{t('confirmPassword.noMatch')}</span>
      </>
    )}
  </div>
)}
```

**Verification:**
- [ ] Both match and no-match messages use translations

---

### TASK 19: Replace Terms and Conditions Strings
**Size:** S (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 877-914

**Description:** Replace terms and conditions checkbox label text with translations.

**Implementation Steps:**
1. Replace "I agree to the" at line 892
2. Replace "Terms of Service" at line 893-901
3. Replace "and" at line 903
4. Replace "Privacy Policy" at line 905-912

**Code Changes:**

Lines 891-914:
```tsx
<label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700">
  {t('terms.agreeTo')}{' '}
  <button
    type="button"
    className="text-blue-600 hover:text-blue-700 underline"
    onClick={() => {
      // TODO: Open terms modal or navigate to terms page
      console.log('Terms of Service clicked');
    }}
  >
    {t('terms.termsOfService')}
  </button>
  {' '}{t('terms.and')}{' '}
  <button
    type="button"
    className="text-blue-600 hover:text-blue-700 underline"
    onClick={() => {
      // TODO: Open privacy modal or navigate to privacy page
      console.log('Privacy Policy clicked');
    }}
  >
    {t('terms.privacyPolicy')}
  </button>
</label>
```

**Verification:**
- [ ] All four terms-related strings use translations

---

### TASK 20: Replace Submit Button Strings
**Size:** S (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 924-965

**Description:** Replace all submit button text variations with translations.

**Implementation Steps:**
1. Replace "Connecting to Google..." at line 934
2. Replace "Create Account" (Google) at line 943
3. Replace "Creating Account..." at line 956
4. Replace "Create Account" (Email) at line 961

**Code Changes:**

Lines 931-945 (Google button):
```tsx
{isOAuthActive ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    {t('button.connectingGoogle')}
  </>
) : (
  <>
    <img
      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
      alt="Google"
      className="w-5 h-5 mr-2"
    />
    {t('button.createAccount')}
  </>
)}
```

Lines 953-963 (Email button):
```tsx
{isLoading ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    {t('button.creatingAccount')}
  </>
) : (
  <>
    <UserPlus className="w-4 h-4 mr-2" />
    {t('button.createAccount')}
  </>
)}
```

**Verification:**
- [ ] All button state texts use translations

---

### TASK 21: Replace Helper Text
**Size:** XS (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Lines:** 968-972

**Description:** Replace the helper text at the bottom of the form.

**Implementation Steps:**
1. Locate the helper text paragraph at line 969-971
2. Replace hardcoded text with translation call

**Code Change:**
```tsx
<div className="text-center">
  <p className="text-sm text-gray-600">
    {t('helper.linkedToCode')}
  </p>
</div>
```

**Verification:**
- [ ] Helper text uses translation

---

### TASK 22: Update Error Display to Resolve Translation Keys
**Size:** S (1 Story Point)
**File:** `/src/components/RegistrationForm.tsx`
**Multiple locations**

**Description:** Update all error message displays to resolve the translation keys returned by validateField.

**Implementation Steps:**
1. Find all instances of `{errors.fieldName}` in JSX
2. Update to call tErrors with the error key

**Code Changes:**

Line 705 (email error):
```tsx
{errors.email && (
  <p className="text-red-600 text-sm mt-1">{tErrors(errors.email)}</p>
)}
```

Line 734 (fullName error):
```tsx
{errors.fullName && (
  <p className="text-red-600 text-sm mt-1">{tErrors(errors.fullName)}</p>
)}
```

Line 809 (password error):
```tsx
{errors.password && (
  <p className="text-red-600 text-sm mt-1">{tErrors(errors.password)}</p>
)}
```

Line 871 (confirmPassword error):
```tsx
{errors.confirmPassword && (
  <p className="text-red-600 text-sm mt-1">{tErrors(errors.confirmPassword)}</p>
)}
```

Line 917 (agreeToTerms error):
```tsx
{errors.agreeToTerms && (
  <p className="text-red-600 text-sm mt-1 ml-7">{tErrors(errors.agreeToTerms)}</p>
)}
```

**Verification:**
- [ ] All five error displays use tErrors() for key resolution
- [ ] Error messages display correctly when validation fails

---

### TASK 23: Build Verification and Type Check
**Size:** S (1 Story Point)
**File:** Multiple

**Description:** Verify all changes compile and the component functions correctly.

**Implementation Steps:**
1. Run TypeScript compilation check
2. Run the development server
3. Navigate to registration page
4. Verify no console errors

**Commands:**
```bash
npm run build
# or
npm run type-check
```

**Verification:**
- [ ] No TypeScript errors
- [ ] No runtime errors in console
- [ ] Component renders correctly

---

### TASK 24: Manual Testing - All String Replacements
**Size:** M (2 Story Points)
**File:** Browser

**Description:** Verify all strings display correctly in the registration form.

**Test Cases:**
1. Load registration form
2. Verify email field label and placeholder
3. Verify registration method selector (for Gmail addresses)
4. Verify full name field label, optional text, placeholder
5. Verify password field label and placeholder
6. Enter password and verify strength indicator labels
7. Verify requirements list displays correctly
8. Verify confirm password field and match indicators
9. Verify terms and conditions text
10. Verify submit button text in all states
11. Submit with validation errors and verify error messages

**Verification:**
- [ ] All 50+ strings display from translations
- [ ] No hardcoded English text remains visible
- [ ] Form functionality unchanged

---

## Implementation Order Summary

Execute tasks in this sequence:

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 - Setup | 1, 2 | Add imports and hook initialization |
| 2 - Translations | 3, 4 | Add all keys to en.json |
| 3 - Refactoring | 5, 6, 7, 8 | Update functions to return keys |
| 4 - JSX Updates | 9-21 | Replace all hardcoded strings in JSX |
| 5 - Error Handling | 22 | Update error display logic |
| 6 - Verification | 23, 24 | Build check and manual testing |

---

## Total Effort Summary

| Category | Tasks | Story Points |
|----------|-------|--------------|
| Setup | 2 | 2 |
| Translation Files | 2 | 3 |
| Function Refactoring | 4 | 6 |
| JSX String Replacement | 13 | 12 |
| Error Handling | 1 | 1 |
| Verification | 2 | 3 |
| **Total** | **24** | **27** |

**Estimated Implementation Time:** 1-2 days for experienced developer

---

## Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| `/src/components/RegistrationForm.tsx` | Component | Import, hooks, refactored functions, 50+ string replacements |
| `/messages/en.json` | Translation | ~60 new translation keys |

---

## Acceptance Criteria Checklist

- [ ] All hardcoded English strings in RegistrationForm are replaced with i18n translation keys
- [ ] Form field labels and placeholders reference auth.register namespace translations
- [ ] Validation error messages are retrieved from errors.form namespace translations
- [ ] Button text and calls-to-action use translation keys
- [ ] Helper text and instructional content is translatable
- [ ] Error state messages display in the user's language
- [ ] Password strength indicator displays translated labels
- [ ] Password requirements list shows translated items
- [ ] Registration method selector (Gmail users) uses translations
- [ ] Component renders correctly when language is switched
- [ ] No English fallback text appears when translations are available
- [ ] Form functionality remains unchanged after internationalization
- [ ] Gmail domain detection flow remains functional
- [ ] Terms and conditions checkbox validation works correctly
- [ ] Build passes with no TypeScript errors

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A: Authentication & Registration*
*Task 2A.4: Update `/src/components/RegistrationForm.tsx` (largest file)*
*Last Modified: 2026-01-20*
