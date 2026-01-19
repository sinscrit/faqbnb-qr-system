# REQ-357: Update RegistrationForm.tsx for Internationalization - Detailed Task Breakdown

**Created:** 2026-01-19 17:45 UTC
**Last Modified:** 2026-01-19 17:45 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.4
**Request Type:** ENHANCEMENT
**Size:** L (Large)
**Priority:** P1 - High

---

## Document Purpose

This document provides granular, actionable tasks for internationalizing the `RegistrationForm.tsx` component. Each task is designed to be approximately 1 story point and can be executed independently by an AI coding agent or junior developer.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 Foundation is complete (next-intl installed, IntlProvider configured)
- [ ] The `/messages/en.json` file exists and is properly structured
- [ ] The `useTranslations` hook is available from `next-intl`
- [ ] Task 2A.1 (Create auth namespace structure) is complete or in progress

---

## Task Summary

| Task # | Description | Estimate | Dependencies |
|--------|-------------|----------|--------------|
| 1 | Add next-intl import and initialize hooks | Trivial | None |
| 2 | Add auth.register namespace translations to en.json | Medium | Task 1 |
| 3 | Add errors.form namespace translations to en.json | Small | None |
| 4 | Add errors.auth namespace translations to en.json | Trivial | None |
| 5 | Refactor calculatePasswordStrength for translations | Medium | Tasks 1, 2 |
| 6 | Update validateField function with translated messages | Medium | Tasks 1, 3 |
| 7 | Move REGISTRATION_METHOD_OPTIONS inside component | Small | Tasks 1, 2 |
| 8 | Update general error alert section | Trivial | Tasks 1, 2 |
| 9 | Update access code info section | Trivial | Tasks 1, 2 |
| 10 | Update email field section | Small | Tasks 1, 2 |
| 11 | Update registration method selector | Small | Tasks 1, 2, 7 |
| 12 | Update full name field section | Small | Tasks 1, 2 |
| 13 | Update password field and strength indicator | Medium | Tasks 1, 2, 5 |
| 14 | Update confirm password field | Small | Tasks 1, 2 |
| 15 | Update terms and conditions section | Small | Tasks 1, 2 |
| 16 | Update submit buttons | Small | Tasks 1, 2 |
| 17 | Update helper text footer | Trivial | Tasks 1, 2 |
| 18 | Update error handler messages | Small | Tasks 1, 4 |
| 19 | Copy translations to other language files | Medium | Tasks 2, 3, 4 |
| 20 | Manual testing and validation | Medium | All above |

---

## Detailed Tasks

### Task 1: Add next-intl Import and Initialize Hooks

**Estimate:** Trivial (5 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Add the useTranslations import from next-intl and initialize the translation hooks inside the component function.

**Steps:**

1. Open `/src/components/RegistrationForm.tsx`
2. Add import statement after existing imports (line 9):
```typescript
import { useTranslations } from 'next-intl';
```

3. Inside the `RegistrationForm` function component, after line 73 (after `const [oauthLoading, setOauthLoading] = useState(false);`), add:
```typescript
// L10N: Translation hooks for internationalization
const t = useTranslations('auth.register');
const tErrors = useTranslations('errors');
const tCommon = useTranslations('common');
```

**Verification:**
- [ ] File compiles without errors
- [ ] No TypeScript errors related to imports
- [ ] Component still renders (translation keys will show as missing initially)

---

### Task 2: Add auth.register Namespace Translations to en.json

**Estimate:** Medium (15 minutes)
**File:** `/messages/en.json`

**Description:** Add all required translation keys for the registration form to the English translation file.

**Steps:**

1. Open `/messages/en.json`
2. Within the `auth` object, add a new `register` nested object with all required keys:

```json
{
  "auth": {
    "register": {
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

**Note:** Merge this into the existing `auth` object structure, keeping existing keys intact.

**Verification:**
- [ ] JSON file is valid (no syntax errors)
- [ ] All keys match the expected structure in the overview document
- [ ] Existing translations are preserved

---

### Task 3: Add errors.form Namespace Translations to en.json

**Estimate:** Small (10 minutes)
**File:** `/messages/en.json`

**Description:** Add form validation error messages to the errors namespace.

**Steps:**

1. Open `/messages/en.json`
2. Within the `errors` object, add the `form` nested object:

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
    }
  }
}
```

**Note:** Merge this into the existing `errors` object structure, keeping existing keys intact.

**Verification:**
- [ ] JSON file is valid
- [ ] All validation message keys exist
- [ ] Keys follow the form.{field}.{errorType} pattern

---

### Task 4: Add errors.auth Namespace Translations to en.json

**Estimate:** Trivial (5 minutes)
**File:** `/messages/en.json`

**Description:** Add authentication-specific error messages to the errors namespace.

**Steps:**

1. Open `/messages/en.json`
2. Within the `errors` object, add the `auth` nested object:

```json
{
  "errors": {
    "auth": {
      "oauthFailed": "OAuth registration failed",
      "registrationFailed": "Registration failed",
      "unexpectedError": "An unexpected error occurred during registration"
    }
  }
}
```

**Note:** Merge into existing `errors` object.

**Verification:**
- [ ] JSON file is valid
- [ ] Error keys align with catch block messages in the component

---

### Task 5: Refactor calculatePasswordStrength for Translations

**Estimate:** Medium (15 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** The `calculatePasswordStrength` function (lines 155-207) is defined outside the component and uses hardcoded strings. It needs to be moved inside the component or refactored to accept translations as a parameter.

**Approach:** Move the function inside the component where it can access the `t` hook.

**Steps:**

1. Find the `calculatePasswordStrength` function (lines 155-207)
2. Move it inside the `RegistrationForm` component function, after the translation hooks initialization
3. Update all hardcoded strings to use translations:

**Before (snippet):**
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

**After (snippet):**
```typescript
const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedback: [], color: 'gray-300', label: t('passwordStrength.enter') };
  }
  // ... (length check)
  feedback.push(t('passwordStrength.minChars'));
  // ... (lowercase check)
  feedback.push(t('passwordStrength.lowercase'));
  // ... (uppercase check)
  feedback.push(t('passwordStrength.uppercase'));
  // ... (number check)
  feedback.push(t('passwordStrength.number'));
  // ... (special char check)
  feedback.push(t('passwordStrength.special'));

  const labels = [
    t('passwordStrength.veryWeak'),
    t('passwordStrength.weak'),
    t('passwordStrength.fair'),
    t('passwordStrength.good'),
    t('passwordStrength.strong')
  ];
```

**Full function update:**
```typescript
// Inside component, after translation hooks
const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedback: [], color: 'gray-300', label: t('passwordStrength.enter') };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push(t('passwordStrength.minChars'));
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push(t('passwordStrength.lowercase'));
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push(t('passwordStrength.uppercase'));
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push(t('passwordStrength.number'));
  }

  // Special character check
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push(t('passwordStrength.special'));
  }

  const colors = ['red-300', 'red-400', 'yellow-400', 'blue-400', 'green-400'];
  const labels = [
    t('passwordStrength.veryWeak'),
    t('passwordStrength.weak'),
    t('passwordStrength.fair'),
    t('passwordStrength.good'),
    t('passwordStrength.strong')
  ];

  return {
    score: Math.min(score, 4),
    feedback,
    color: colors[Math.min(score, 4)],
    label: labels[Math.min(score, 4)]
  };
};
```

**Verification:**
- [ ] Function compiles without errors
- [ ] Password strength indicator displays translated labels
- [ ] Requirements list shows translated text
- [ ] All 5 strength levels display correctly

---

### Task 6: Update validateField Function with Translated Messages

**Estimate:** Medium (15 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the `validateField` function (lines 212-245) to return translated error messages.

**Steps:**

1. Locate the `validateField` function (approximately lines 212-245)
2. Replace each hardcoded error string with the appropriate `tErrors()` call:

**Before:**
```typescript
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
```

**After:**
```typescript
case 'email':
  if (!value) return tErrors('form.email.required');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value as string)) return tErrors('form.email.invalid');
  return undefined;

case 'password':
  if (!value) return tErrors('form.password.required');
  const password = value as string;
  if (password.length < 8) return tErrors('form.password.tooShort');
  if (!/[a-z]/.test(password)) return tErrors('form.password.lowercase');
  if (!/[A-Z]/.test(password)) return tErrors('form.password.uppercase');
  if (!/\d/.test(password)) return tErrors('form.password.number');
  return undefined;

case 'confirmPassword':
  if (!value) return tErrors('form.confirmPassword.required');
  if (value !== formData.password) return tErrors('form.confirmPassword.mismatch');
  return undefined;

case 'fullName':
  if (value && (value as string).length < 2) return tErrors('form.fullName.tooShort');
  return undefined;

case 'agreeToTerms':
  if (!value) return tErrors('form.agreeToTerms.required');
  return undefined;
```

**Verification:**
- [ ] Validation messages display in English (default)
- [ ] Each validation scenario triggers the correct translated message
- [ ] No TypeScript errors

---

### Task 7: Move REGISTRATION_METHOD_OPTIONS Inside Component

**Estimate:** Small (10 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** The `REGISTRATION_METHOD_OPTIONS` constant (lines 555-566) is defined outside the component and uses hardcoded strings. Move it inside the component and use translations.

**Steps:**

1. Remove the existing `REGISTRATION_METHOD_OPTIONS` constant (lines 555-566)
2. Inside the component function (after the translation hooks), add:

**After:**
```typescript
// REQ-222: Registration method options for Gmail users (L10N)
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

3. Update the reference in `registrationMethodSelector` (approximately line 579) from `REGISTRATION_METHOD_OPTIONS` to `registrationMethodOptions`:

**Before:**
```tsx
{REGISTRATION_METHOD_OPTIONS.map((option) => (
```

**After:**
```tsx
{registrationMethodOptions.map((option) => (
```

**Verification:**
- [ ] Registration method selector displays translated labels
- [ ] Both Google and email options show translated descriptions
- [ ] No TypeScript errors

---

### Task 8: Update General Error Alert Section

**Estimate:** Trivial (5 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the error alert title text.

**Location:** Lines 660-670

**Steps:**

1. Find the error alert section (line 665):
```tsx
<h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
```

2. Replace with:
```tsx
<h3 className="text-sm font-medium text-red-800">{t('failed')}</h3>
```

**Verification:**
- [ ] Error alert displays translated title
- [ ] Error message content still displays correctly

---

### Task 9: Update Access Code Info Section

**Estimate:** Trivial (5 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the access code label text.

**Location:** Lines 673-682

**Steps:**

1. Find the access code info section (approximately line 677-678):
```tsx
<p className="text-sm text-green-800">
  Access code: <span className="font-mono font-semibold">{accessCode.substring(0, 4)}...</span>
</p>
```

2. Replace with:
```tsx
<p className="text-sm text-green-800">
  {t('accessCodeInfo')} <span className="font-mono font-semibold">{accessCode.substring(0, 4)}...</span>
</p>
```

**Verification:**
- [ ] Access code label displays in selected language
- [ ] Access code value still displays correctly (masked)

---

### Task 10: Update Email Field Section

**Estimate:** Small (10 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the email field label, placeholder, and helper text.

**Location:** Lines 684-707

**Steps:**

1. Update the label (line 686-688):
```tsx
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
  {t('emailLabel')}
</label>
```

2. Update the placeholder (line 697):
```tsx
placeholder={t('emailPlaceholder')}
```

3. Update the helper text (lines 701-703):
```tsx
<p className="text-xs text-gray-500 mt-1">
  {t('emailLinked')}
</p>
```

**Verification:**
- [ ] Email label displays in selected language
- [ ] Placeholder text displays in selected language
- [ ] Helper text below field displays in selected language

---

### Task 11: Update Registration Method Selector

**Estimate:** Small (10 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the section label and divider text in the registration method selector.

**Location:** Lines 569-655

**Steps:**

1. Update the section label (line 571):
```tsx
<label className="block text-sm font-medium text-gray-700">
  {t('chooseMethod')}
</label>
```

2. Update the divider text (line 650):
```tsx
<span className="px-2 bg-white text-gray-500">{t('enterDetails')}</span>
```

**Note:** The option labels are already handled by Task 7.

**Verification:**
- [ ] "Choose how to create your account" label is translated
- [ ] "Enter your details below" divider text is translated
- [ ] Radio button labels and descriptions are translated (from Task 7)

---

### Task 12: Update Full Name Field Section

**Estimate:** Small (10 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the full name field label, optional indicator, and placeholder.

**Location:** Lines 713-737

**Steps:**

1. Update the label (lines 717-719):
```tsx
<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
  {t('fullNameLabel')} <span className="text-gray-400">{t('fullNameOptional')}</span>
</label>
```

2. Update the placeholder (line 730):
```tsx
placeholder={t('fullNamePlaceholder')}
```

**Verification:**
- [ ] "Full Name" label displays in selected language
- [ ] "(optional)" indicator displays in selected language
- [ ] Placeholder "John Doe" displays in selected language

---

### Task 13: Update Password Field and Strength Indicator

**Estimate:** Medium (15 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the password field label, placeholder, and strength indicator labels.

**Location:** Lines 740-811

**Steps:**

1. Update the label (lines 744-746):
```tsx
<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
  {t('passwordLabel')}
</label>
```

2. Update the placeholder (line 758):
```tsx
placeholder={t('passwordPlaceholder')}
```

3. Update the strength indicator label (line 781):
```tsx
<span className="text-gray-600">{t('passwordStrength.label')}</span>
```

4. Update the requirements header (line 794):
```tsx
<p className="text-xs text-gray-600">{t('passwordStrength.requirements')}</p>
```

**Note:** The strength labels and requirement items are already handled by Task 5.

**Verification:**
- [ ] "Password" label displays in selected language
- [ ] Placeholder displays in selected language
- [ ] "Password strength:" label is translated
- [ ] "Requirements:" header is translated
- [ ] Individual requirement items are translated (from Task 5)

---

### Task 14: Update Confirm Password Field

**Estimate:** Small (10 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the confirm password field label, placeholder, and match indicators.

**Location:** Lines 814-874

**Steps:**

1. Update the label (line 819-820):
```tsx
<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
  {t('confirmPasswordLabel')}
</label>
```

2. Update the placeholder (line 834):
```tsx
placeholder={t('confirmPasswordPlaceholder')}
```

3. Update the "Passwords match" indicator (line 859):
```tsx
<span className="text-xs text-green-600">{t('passwordMatch.match')}</span>
```

4. Update the "Passwords do not match" indicator (line 864):
```tsx
<span className="text-xs text-red-600">{t('passwordMatch.noMatch')}</span>
```

**Verification:**
- [ ] "Confirm Password" label displays in selected language
- [ ] Placeholder displays in selected language
- [ ] "Passwords match" indicator is translated
- [ ] "Passwords do not match" indicator is translated

---

### Task 15: Update Terms and Conditions Section

**Estimate:** Small (10 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the terms checkbox label and link text.

**Location:** Lines 876-919

**Steps:**

1. Update the checkbox label (lines 891-913):
```tsx
<label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700">
  {t('termsLabel')}{' '}
  <button
    type="button"
    className="text-blue-600 hover:text-blue-700 underline"
    onClick={() => {
      console.log('Terms of Service clicked');
    }}
  >
    {t('termsOfService')}
  </button>
  {' '}{t('and')}{' '}
  <button
    type="button"
    className="text-blue-600 hover:text-blue-700 underline"
    onClick={() => {
      console.log('Privacy Policy clicked');
    }}
  >
    {t('privacyPolicy')}
  </button>
</label>
```

**Verification:**
- [ ] "I agree to the" text is translated
- [ ] "Terms of Service" link text is translated
- [ ] "and" connector is translated
- [ ] "Privacy Policy" link text is translated

---

### Task 16: Update Submit Buttons

**Estimate:** Small (10 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the submit button text and loading states for both Google and email registration flows.

**Location:** Lines 924-965

**Steps:**

1. Update Google OAuth button loading text (line 934):
```tsx
{t('connectingGoogle')}
```

2. Update Google OAuth button text (line 943-944):
```tsx
{t('submitButton')}
```

3. Update email submit button loading text (line 955-956):
```tsx
{t('creating')}
```

4. Update email submit button text (line 960-961):
```tsx
{t('submitButton')}
```

**Full updated button sections:**

```tsx
{/* Google OAuth button */}
{isOAuthActive ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    {t('connectingGoogle')}
  </>
) : (
  <>
    <img
      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
      alt="Google"
      className="w-5 h-5 mr-2"
    />
    {t('submitButton')}
  </>
)}

{/* Email/password submit button */}
{isLoading ? (
  <>
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    {t('creating')}
  </>
) : (
  <>
    <UserPlus className="w-4 h-4 mr-2" />
    {t('submitButton')}
  </>
)}
```

**Verification:**
- [ ] "Connecting to Google..." loading state is translated
- [ ] "Create Account" button text is translated (both buttons)
- [ ] "Creating Account..." loading state is translated

---

### Task 17: Update Helper Text Footer

**Estimate:** Trivial (5 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the footer helper text.

**Location:** Lines 968-972

**Steps:**

1. Update the helper text (lines 969-971):
```tsx
<p className="text-sm text-gray-600">
  {t('accountLinked')}
</p>
```

**Verification:**
- [ ] Footer helper text displays in selected language

---

### Task 18: Update Error Handler Messages

**Estimate:** Small (10 minutes)
**File:** `/src/components/RegistrationForm.tsx`

**Description:** Update the error messages in the OAuth and form submission handlers.

**Steps:**

1. Update OAuth completion error (line 459):
```typescript
const errorMessage = error instanceof Error ? error.message : tErrors('auth.oauthFailed');
```

2. Update registration failed error (line 542):
```typescript
setErrors({ general: result.error || tErrors('auth.registrationFailed') });
onError?.(result.error || tErrors('auth.registrationFailed'));
```

3. Update unexpected error (line 548):
```typescript
const errorMessage = error instanceof Error ? error.message : tErrors('auth.unexpectedError');
```

**Verification:**
- [ ] OAuth error displays translated message when no specific error provided
- [ ] Registration failure displays translated message
- [ ] Unexpected errors display translated fallback message

---

### Task 19: Copy Translations to Other Language Files

**Estimate:** Medium (20 minutes)
**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

**Description:** Copy the new translation keys to all other language files and provide translated values.

**Steps:**

1. Copy the `auth.register` structure from `en.json` to each language file
2. Translate all values appropriately
3. Copy the `errors.form` and `errors.auth` structures to each language file
4. Translate all error messages

**French (fr.json) Example:**
```json
{
  "auth": {
    "register": {
      "failed": "Échec de l'inscription",
      "accessCodeInfo": "Code d'accès :",
      "emailLabel": "Adresse e-mail",
      "emailPlaceholder": "email@exemple.com",
      "emailLinked": "Cet e-mail est lié à votre code d'accès et ne peut pas être modifié.",
      "chooseMethod": "Choisissez comment créer votre compte",
      "googleOption": "Continuer avec Google",
      "googleDescription": "Inscription rapide via votre compte Google",
      "emailOption": "S'inscrire par e-mail",
      "emailDescription": "Créer un mot de passe pour votre compte",
      "enterDetails": "Entrez vos informations ci-dessous",
      "fullNameLabel": "Nom complet",
      "fullNameOptional": "(facultatif)",
      "fullNamePlaceholder": "Jean Dupont",
      "passwordLabel": "Mot de passe",
      "passwordPlaceholder": "Créez un mot de passe fort",
      "confirmPasswordLabel": "Confirmer le mot de passe",
      "confirmPasswordPlaceholder": "Confirmez votre mot de passe",
      "termsLabel": "J'accepte les",
      "termsOfService": "Conditions d'utilisation",
      "and": "et la",
      "privacyPolicy": "Politique de confidentialité",
      "submitButton": "Créer un compte",
      "creating": "Création du compte...",
      "connectingGoogle": "Connexion à Google...",
      "accountLinked": "Votre compte sera lié à votre code d'accès vérifié",
      "passwordStrength": {
        "label": "Force du mot de passe :",
        "enter": "Entrez un mot de passe",
        "veryWeak": "Très faible",
        "weak": "Faible",
        "fair": "Moyen",
        "good": "Bon",
        "strong": "Fort",
        "requirements": "Exigences :",
        "minChars": "Au moins 8 caractères",
        "lowercase": "Une lettre minuscule",
        "uppercase": "Une lettre majuscule",
        "number": "Un chiffre",
        "special": "Un caractère spécial"
      },
      "passwordMatch": {
        "match": "Les mots de passe correspondent",
        "noMatch": "Les mots de passe ne correspondent pas"
      }
    }
  },
  "errors": {
    "form": {
      "email": {
        "required": "L'e-mail est requis",
        "invalid": "Veuillez entrer une adresse e-mail valide"
      },
      "password": {
        "required": "Le mot de passe est requis",
        "tooShort": "Le mot de passe doit contenir au moins 8 caractères",
        "lowercase": "Le mot de passe doit contenir au moins une lettre minuscule",
        "uppercase": "Le mot de passe doit contenir au moins une lettre majuscule",
        "number": "Le mot de passe doit contenir au moins un chiffre"
      },
      "confirmPassword": {
        "required": "Veuillez confirmer votre mot de passe",
        "mismatch": "Les mots de passe ne correspondent pas"
      },
      "fullName": {
        "tooShort": "Le nom doit contenir au moins 2 caractères"
      },
      "agreeToTerms": {
        "required": "Vous devez accepter les conditions d'utilisation"
      }
    },
    "auth": {
      "oauthFailed": "Échec de l'inscription OAuth",
      "registrationFailed": "Échec de l'inscription",
      "unexpectedError": "Une erreur inattendue s'est produite lors de l'inscription"
    }
  }
}
```

**Note:** Repeat for Spanish (es), German (de), Dutch (nl), and Italian (it). Use appropriate professional translations for each language.

**Verification:**
- [ ] All 5 non-English files have the complete structure
- [ ] JSON files are valid (no syntax errors)
- [ ] Translations are appropriate for each language

---

### Task 20: Manual Testing and Validation

**Estimate:** Medium (20 minutes)
**Prerequisites:** All above tasks complete

**Description:** Verify all translations work correctly in the application.

**Testing Checklist:**

**Form Load Testing:**
- [ ] Form loads without errors in English (default)
- [ ] Form loads in each of the 6 supported languages
- [ ] No console errors related to missing translations

**Field Label Testing:**
- [ ] Email Address label is translated
- [ ] Full Name label and "(optional)" indicator are translated
- [ ] Password label is translated
- [ ] Confirm Password label is translated

**Placeholder Testing:**
- [ ] Email placeholder is translated
- [ ] Full Name placeholder is translated (John Doe → Jean Dupont, etc.)
- [ ] Password placeholder is translated
- [ ] Confirm Password placeholder is translated

**Registration Method Testing (Gmail users):**
- [ ] "Choose how to create your account" label is translated
- [ ] "Continue with Google" option is translated
- [ ] "Quick sign-up using your Google account" description is translated
- [ ] "Sign up with email" option is translated
- [ ] "Create a password for your account" description is translated
- [ ] "Enter your details below" divider is translated

**Password Strength Testing:**
- [ ] "Password strength:" label is translated
- [ ] "Enter password" initial state is translated
- [ ] Strength labels (Very Weak, Weak, Fair, Good, Strong) are translated
- [ ] "Requirements:" header is translated
- [ ] All requirement items are translated

**Password Match Testing:**
- [ ] "Passwords match" indicator is translated
- [ ] "Passwords do not match" indicator is translated

**Terms and Conditions Testing:**
- [ ] "I agree to the" text is translated
- [ ] "Terms of Service" link text is translated
- [ ] "and" connector is translated
- [ ] "Privacy Policy" link text is translated

**Button Testing:**
- [ ] "Create Account" button text is translated (both Google and email)
- [ ] "Creating Account..." loading state is translated
- [ ] "Connecting to Google..." loading state is translated

**Helper Text Testing:**
- [ ] Access code info label is translated
- [ ] Email helper text is translated
- [ ] Footer helper text is translated

**Validation Error Testing:**
- [ ] Email required error is translated
- [ ] Invalid email error is translated
- [ ] Password required error is translated
- [ ] Password too short error is translated
- [ ] Password missing lowercase error is translated
- [ ] Password missing uppercase error is translated
- [ ] Password missing number error is translated
- [ ] Confirm password required error is translated
- [ ] Passwords mismatch error is translated
- [ ] Full name too short error is translated
- [ ] Terms agreement required error is translated

**Error Alert Testing:**
- [ ] "Registration Failed" alert title is translated

**Layout Verification:**
- [ ] No text overflow in any language (especially German ~30% longer)
- [ ] Buttons don't truncate text
- [ ] Form layout remains consistent across languages

**Accessibility Testing:**
- [ ] Form labels maintain proper association with inputs
- [ ] Error messages are accessible
- [ ] Password visibility toggle maintains accessibility

---

## Acceptance Criteria Verification Matrix

| Acceptance Criterion | Implementing Tasks | Verified |
|---------------------|-------------------|----------|
| All form field labels appear in selected language | Tasks 10, 11, 12, 13, 14, 15 | [ ] |
| All placeholder text reflects selected language | Tasks 10, 12, 13, 14 | [ ] |
| All validation error messages display in selected language | Task 6 | [ ] |
| Button text and loading states appear in selected language | Task 16 | [ ] |
| Password strength indicators show in selected language | Tasks 5, 13 | [ ] |
| Registration method selection labels appear in selected language | Tasks 7, 11 | [ ] |
| OAuth flow messages display in selected language | Tasks 16, 18 | [ ] |
| Terms and conditions text appears in selected language | Task 15 | [ ] |
| Help text and informational messages show in selected language | Tasks 9, 10, 17 | [ ] |
| Error messages from form submission appear in selected language | Tasks 8, 18 | [ ] |
| All conditional UI text based on email domain displays in selected language | Tasks 7, 11 | [ ] |
| Success and confirmation messages appear in selected language | Task 18 | [ ] |

---

## Risk Mitigation Notes

| Risk | Mitigation Strategy |
|------|---------------------|
| Text overflow in longer languages (German) | Test form with German translations; design has 40% buffer |
| Password strength function scope | Move function inside component to access hooks |
| Breaking existing tests | Run existing test suite after each task |
| Missing translation keys | Use next-intl build-time checking |
| Validation timing issues | Ensure translations don't affect validation performance |

---

## References

- [Overview Document](/docs/REQ-357-update-srccomponentsregistrationformtsx-largest-overview.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-357)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Component File](/src/components/RegistrationForm.tsx)
- [English Translations](/messages/en.json)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB L10N Epic 2 - Task 2A.4*
*Last Modified: 2026-01-19 17:45 UTC*
