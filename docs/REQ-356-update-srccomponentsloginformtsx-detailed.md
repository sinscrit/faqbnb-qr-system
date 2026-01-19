# REQ-356: Update LoginForm.tsx for Internationalization - Detailed Task Breakdown

**Created:** 2026-01-19 15:45 UTC
**Last Modified:** 2026-01-19 15:45 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.3
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High
**Overview Document:** [REQ-356-update-srccomponentsloginformtsx-overview.md](./REQ-356-update-srccomponentsloginformtsx-overview.md)

---

## Executive Summary

This document provides granular, implementation-ready tasks for internationalizing the `LoginForm.tsx` component. The component contains approximately 17 unique user-facing strings across validation messages, error handling, form labels, placeholders, and button text. All tasks are designed to be approximately 1 story point each, suitable for AI coding agents or junior developers to execute step-by-step.

---

## Prerequisites Checklist

Before beginning implementation, verify:

- [x] next-intl package is installed (`package.json`)
- [x] IntlProvider is configured (`/src/app/layout.tsx`)
- [x] Translation files exist (`/messages/*.json`)
- [x] LogoutButton.tsx serves as reference pattern (already internationalized)
- [ ] Task 2A.1 (auth namespace structure) is complete or will be done in parallel

---

## File Inventory

### Primary Implementation File
| File | Current State | Target State |
|------|---------------|--------------|
| `/src/components/LoginForm.tsx` | 336 lines, hardcoded English strings | Internationalized with `useTranslations` |

### Translation Files to Update
| File | Changes Required |
|------|-----------------|
| `/messages/en.json` | Add `auth.login.form`, `auth.login.error`, `auth.login.validation` keys |
| `/messages/fr.json` | Add French translations for all new keys |
| `/messages/es.json` | Add Spanish translations for all new keys |
| `/messages/de.json` | Add German translations for all new keys |
| `/messages/nl.json` | Add Dutch translations for all new keys |
| `/messages/it.json` | Add Italian translations for all new keys |

---

## Complete String Extraction Inventory

| ID | Line | Current String | Translation Key | Category |
|----|------|----------------|-----------------|----------|
| S1 | 51 | `'Email is required'` | `auth.login.validation.emailRequired` | Validation |
| S2 | 53 | `'Please enter a valid email address'` | `auth.login.validation.invalidEmail` | Validation |
| S3 | 57 | `'Password is required'` | `auth.login.validation.passwordRequired` | Validation |
| S4 | 58 | `'Password must be at least 6 characters'` | `auth.login.validation.passwordMinLength` | Validation |
| S5 | 138 | `'Invalid email or password...'` | `auth.login.error.invalidCredentials` | Error |
| S6 | 141 | `'Access denied. Admin privileges are required.'` | `auth.login.error.accessDenied` | Error |
| S7 | 161 | `'Login failed: No user returned'` | `auth.login.error.noUserReturned` | Error |
| S8 | 196 | `'Authentication Failed'` | `auth.login.error.title` | Error |
| S9 | 206 | `'Sign in with your account'` | `auth.login.oauthPrompt` | UI Text |
| S10 | 222 | `'Or continue with email'` | `auth.login.divider` | UI Text |
| S11 | 232 | `'Email Address'` | `auth.login.form.emailLabel` | Form |
| S12 | 244 | `'admin@faqbnb.com'` | `auth.login.form.emailPlaceholder` | Form |
| S13 | 256 | `'Password'` | `auth.login.form.passwordLabel` | Form |
| S14 | 269 | `'Enter your password'` | `auth.login.form.passwordPlaceholder` | Form |
| S15 | 304 | `'Remember me for 30 days'` | `auth.login.form.rememberMe` | Form |
| S16 | 317 | `'Signing In...'` | `auth.login.form.submitting` | Form |
| S17 | 322 | `'Sign In with Email'` | `auth.login.form.submitButton` | Form |
| S18 | 330 | `'Access restricted to authorized administrators only'` | `auth.login.restrictedAccess` | UI Text |

---

## Implementation Tasks

### Task 1: Add English Translation Keys to en.json
**Estimate:** 1 Story Point
**Priority:** MUST - Foundation for all other tasks
**Depends On:** None

**Description:**
Expand the `auth` namespace in `/messages/en.json` with LoginForm-specific translation keys. The structure must include `login.form`, `login.validation`, `login.error`, and top-level `login` keys.

**Implementation Steps:**

1. Open `/messages/en.json`
2. Locate the existing `auth` namespace (currently lines 37-56)
3. Replace/expand the `auth` object with the following structure:

**Code to Add (merge with existing auth namespace):**
```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "confirmLogout": "Confirm Logout",
    "confirmSignOutMessage": "Are you sure you want to sign out?",
    "signUp": "Sign Up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "resetPassword": "Reset Password",
    "continueWithGoogle": "Continue with Google",
    "rememberMe": "Remember me",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "createAccount": "Create Account",
    "verifyEmail": "Verify Email",
    "resendVerification": "Resend Verification",
    "welcomeBack": "Welcome back",
    "loggedInAs": "Logged in as",
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
        "submitting": "Signing In..."
      },
      "validation": {
        "emailRequired": "Email is required",
        "invalidEmail": "Please enter a valid email address",
        "passwordRequired": "Password is required",
        "passwordMinLength": "Password must be at least {min} characters"
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

**Verification:**
- [ ] JSON is valid (no syntax errors)
- [ ] All 18 strings from inventory are present
- [ ] ICU format used for `passwordMinLength` with `{min}` placeholder
- [ ] Structure follows nested namespace pattern `auth.login.*`

---

### Task 2: Add French Translations to fr.json
**Estimate:** 1 Story Point
**Priority:** HIGH
**Depends On:** Task 1

**Description:**
Add French translations for all LoginForm keys to `/messages/fr.json`.

**Implementation Steps:**

1. Open `/messages/fr.json`
2. Add/merge the following `auth.login` structure:

**Code to Add:**
```json
{
  "auth": {
    "login": {
      "oauthPrompt": "Connectez-vous avec votre compte",
      "divider": "Ou continuer avec l'email",
      "restrictedAccess": "Accès réservé aux administrateurs autorisés uniquement",
      "form": {
        "emailLabel": "Adresse e-mail",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Mot de passe",
        "passwordPlaceholder": "Entrez votre mot de passe",
        "rememberMe": "Se souvenir de moi pendant 30 jours",
        "submitButton": "Se connecter avec l'email",
        "submitting": "Connexion en cours..."
      },
      "validation": {
        "emailRequired": "L'adresse e-mail est requise",
        "invalidEmail": "Veuillez entrer une adresse e-mail valide",
        "passwordRequired": "Le mot de passe est requis",
        "passwordMinLength": "Le mot de passe doit contenir au moins {min} caractères"
      },
      "error": {
        "title": "Échec de l'authentification",
        "invalidCredentials": "Adresse e-mail ou mot de passe invalide. Veuillez vérifier vos identifiants et réessayer.",
        "accessDenied": "Accès refusé. Les privilèges d'administrateur sont requis.",
        "noUserReturned": "Échec de la connexion : aucun utilisateur retourné"
      }
    }
  }
}
```

**Verification:**
- [ ] JSON is valid
- [ ] All keys match en.json structure exactly
- [ ] `{min}` placeholder preserved in passwordMinLength

---

### Task 3: Add Spanish Translations to es.json
**Estimate:** 1 Story Point
**Priority:** HIGH
**Depends On:** Task 1

**Description:**
Add Spanish translations for all LoginForm keys to `/messages/es.json`.

**Code to Add:**
```json
{
  "auth": {
    "login": {
      "oauthPrompt": "Inicia sesión con tu cuenta",
      "divider": "O continuar con email",
      "restrictedAccess": "Acceso restringido solo a administradores autorizados",
      "form": {
        "emailLabel": "Dirección de correo electrónico",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Contraseña",
        "passwordPlaceholder": "Ingresa tu contraseña",
        "rememberMe": "Recordarme por 30 días",
        "submitButton": "Iniciar sesión con email",
        "submitting": "Iniciando sesión..."
      },
      "validation": {
        "emailRequired": "El correo electrónico es requerido",
        "invalidEmail": "Por favor ingresa una dirección de correo electrónico válida",
        "passwordRequired": "La contraseña es requerida",
        "passwordMinLength": "La contraseña debe tener al menos {min} caracteres"
      },
      "error": {
        "title": "Error de autenticación",
        "invalidCredentials": "Correo electrónico o contraseña inválidos. Por favor verifica tus credenciales e intenta de nuevo.",
        "accessDenied": "Acceso denegado. Se requieren privilegios de administrador.",
        "noUserReturned": "Error de inicio de sesión: no se devolvió ningún usuario"
      }
    }
  }
}
```

---

### Task 4: Add German Translations to de.json
**Estimate:** 1 Story Point
**Priority:** HIGH
**Depends On:** Task 1

**Description:**
Add German translations for all LoginForm keys to `/messages/de.json`.

**Code to Add:**
```json
{
  "auth": {
    "login": {
      "oauthPrompt": "Mit Ihrem Konto anmelden",
      "divider": "Oder mit E-Mail fortfahren",
      "restrictedAccess": "Zugang nur für autorisierte Administratoren",
      "form": {
        "emailLabel": "E-Mail-Adresse",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Passwort",
        "passwordPlaceholder": "Geben Sie Ihr Passwort ein",
        "rememberMe": "30 Tage angemeldet bleiben",
        "submitButton": "Mit E-Mail anmelden",
        "submitting": "Anmeldung läuft..."
      },
      "validation": {
        "emailRequired": "E-Mail-Adresse ist erforderlich",
        "invalidEmail": "Bitte geben Sie eine gültige E-Mail-Adresse ein",
        "passwordRequired": "Passwort ist erforderlich",
        "passwordMinLength": "Das Passwort muss mindestens {min} Zeichen lang sein"
      },
      "error": {
        "title": "Authentifizierung fehlgeschlagen",
        "invalidCredentials": "Ungültige E-Mail-Adresse oder Passwort. Bitte überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut.",
        "accessDenied": "Zugriff verweigert. Administratorrechte erforderlich.",
        "noUserReturned": "Anmeldung fehlgeschlagen: Kein Benutzer zurückgegeben"
      }
    }
  }
}
```

---

### Task 5: Add Dutch Translations to nl.json
**Estimate:** 1 Story Point
**Priority:** HIGH
**Depends On:** Task 1

**Description:**
Add Dutch translations for all LoginForm keys to `/messages/nl.json`.

**Code to Add:**
```json
{
  "auth": {
    "login": {
      "oauthPrompt": "Log in met uw account",
      "divider": "Of ga verder met e-mail",
      "restrictedAccess": "Toegang beperkt tot geautoriseerde beheerders",
      "form": {
        "emailLabel": "E-mailadres",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Wachtwoord",
        "passwordPlaceholder": "Voer uw wachtwoord in",
        "rememberMe": "Onthoud mij voor 30 dagen",
        "submitButton": "Inloggen met e-mail",
        "submitting": "Bezig met inloggen..."
      },
      "validation": {
        "emailRequired": "E-mailadres is verplicht",
        "invalidEmail": "Voer een geldig e-mailadres in",
        "passwordRequired": "Wachtwoord is verplicht",
        "passwordMinLength": "Wachtwoord moet minimaal {min} tekens bevatten"
      },
      "error": {
        "title": "Authenticatie mislukt",
        "invalidCredentials": "Ongeldig e-mailadres of wachtwoord. Controleer uw gegevens en probeer het opnieuw.",
        "accessDenied": "Toegang geweigerd. Beheerdersrechten zijn vereist.",
        "noUserReturned": "Inloggen mislukt: geen gebruiker geretourneerd"
      }
    }
  }
}
```

---

### Task 6: Add Italian Translations to it.json
**Estimate:** 1 Story Point
**Priority:** HIGH
**Depends On:** Task 1

**Description:**
Add Italian translations for all LoginForm keys to `/messages/it.json`.

**Code to Add:**
```json
{
  "auth": {
    "login": {
      "oauthPrompt": "Accedi con il tuo account",
      "divider": "Oppure continua con email",
      "restrictedAccess": "Accesso riservato solo agli amministratori autorizzati",
      "form": {
        "emailLabel": "Indirizzo email",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Inserisci la tua password",
        "rememberMe": "Ricordami per 30 giorni",
        "submitButton": "Accedi con email",
        "submitting": "Accesso in corso..."
      },
      "validation": {
        "emailRequired": "L'indirizzo email è obbligatorio",
        "invalidEmail": "Inserisci un indirizzo email valido",
        "passwordRequired": "La password è obbligatoria",
        "passwordMinLength": "La password deve contenere almeno {min} caratteri"
      },
      "error": {
        "title": "Autenticazione fallita",
        "invalidCredentials": "Email o password non validi. Verifica le tue credenziali e riprova.",
        "accessDenied": "Accesso negato. Sono richiesti privilegi di amministratore.",
        "noUserReturned": "Accesso fallito: nessun utente restituito"
      }
    }
  }
}
```

---

### Task 7: Add useTranslations Import to LoginForm.tsx
**Estimate:** 0.5 Story Point
**Priority:** MUST
**Depends On:** Task 1

**Description:**
Add the next-intl `useTranslations` import to the LoginForm component.

**File:** `/src/components/LoginForm.tsx`

**Implementation:**

Find this line (approximately line 8):
```typescript
import { useRouter } from 'next/navigation';
```

Add after it:
```typescript
import { useTranslations } from 'next-intl';
```

**Verification:**
- [ ] Import statement added correctly
- [ ] No TypeScript errors
- [ ] File compiles successfully

---

### Task 8: Initialize Translation Hook in LoginForm Component
**Estimate:** 0.5 Story Point
**Priority:** MUST
**Depends On:** Task 7

**Description:**
Initialize the `useTranslations` hook inside the LoginForm component function.

**File:** `/src/components/LoginForm.tsx`

**Implementation:**

Find the beginning of the component function (approximately line 28-31):
```typescript
export default function LoginForm({ onSuccess, onError, className = '' }: LoginFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();
```

Add after `const { signIn } = useAuth();`:
```typescript
  const t = useTranslations('auth.login');
```

**Verification:**
- [ ] Hook initialized inside component function
- [ ] Namespace is `'auth.login'`
- [ ] No TypeScript errors

---

### Task 9: Update Validation Messages in validateField Function
**Estimate:** 1 Story Point
**Priority:** HIGH
**Depends On:** Task 8

**Description:**
Replace hardcoded validation messages in the `validateField` function with translation calls.

**File:** `/src/components/LoginForm.tsx`
**Location:** Lines 48-64 (validateField function)

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
      if (!value) return t('validation.emailRequired');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) return t('validation.invalidEmail');
      return undefined;

    case 'password':
      if (!value) return t('validation.passwordRequired');
      if ((value as string).length < 6) return t('validation.passwordMinLength', { min: 6 });
      return undefined;

    default:
      return undefined;
  }
};
```

**Key Changes:**
- Line 51: `'Email is required'` → `t('validation.emailRequired')`
- Line 53: `'Please enter a valid email address'` → `t('validation.invalidEmail')`
- Line 57: `'Password is required'` → `t('validation.passwordRequired')`
- Line 58: `'Password must be at least 6 characters'` → `t('validation.passwordMinLength', { min: 6 })`

**Verification:**
- [ ] All 4 validation strings replaced
- [ ] ICU parameter `{ min: 6 }` passed correctly
- [ ] Form validation still works correctly

---

### Task 10: Update Error Messages in handleSubmit Function
**Estimate:** 1 Story Point
**Priority:** HIGH
**Depends On:** Task 8

**Description:**
Replace hardcoded error messages in the `handleSubmit` function with translation calls.

**File:** `/src/components/LoginForm.tsx`
**Location:** Lines 130-144 and 161

**Before (lines 135-144):**
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

**Before (line 161):**
```typescript
setErrors({ general: 'Login failed: No user returned' });
```

**After:**
```typescript
setErrors({ general: t('error.noUserReturned') });
```

**Key Changes:**
- Line 138: `'Invalid email or password...'` → `t('error.invalidCredentials')`
- Line 141: `'Access denied...'` → `t('error.accessDenied')`
- Line 161: `'Login failed: No user returned'` → `t('error.noUserReturned')`

**Verification:**
- [ ] All 3 error messages replaced
- [ ] Error handling logic unchanged
- [ ] Fallback to raw `errorMessage` preserved for unknown errors

---

### Task 11: Update Error Alert Section
**Estimate:** 0.5 Story Point
**Priority:** HIGH
**Depends On:** Task 8

**Description:**
Replace the hardcoded error alert heading with a translation call.

**File:** `/src/components/LoginForm.tsx`
**Location:** Line 196

**Before:**
```tsx
<h3 className="text-sm font-medium text-red-800">Authentication Failed</h3>
```

**After:**
```tsx
<h3 className="text-sm font-medium text-red-800">{t('error.title')}</h3>
```

**Verification:**
- [ ] Error alert heading uses translation
- [ ] Styling unchanged
- [ ] Alert displays correctly when errors occur

---

### Task 12: Update OAuth Section Text
**Estimate:** 0.5 Story Point
**Priority:** HIGH
**Depends On:** Task 8

**Description:**
Replace the OAuth prompt text with a translation call.

**File:** `/src/components/LoginForm.tsx`
**Location:** Line 206

**Before:**
```tsx
<p className="text-sm font-medium text-gray-700 mb-4">Sign in with your account</p>
```

**After:**
```tsx
<p className="text-sm font-medium text-gray-700 mb-4">{t('oauthPrompt')}</p>
```

**Verification:**
- [ ] OAuth prompt text uses translation
- [ ] Styling unchanged

---

### Task 13: Update Divider Text
**Estimate:** 0.5 Story Point
**Priority:** HIGH
**Depends On:** Task 8

**Description:**
Replace the divider text between OAuth and email form with a translation call.

**File:** `/src/components/LoginForm.tsx`
**Location:** Line 222

**Before:**
```tsx
<span className="px-2 bg-white text-gray-500">Or continue with email</span>
```

**After:**
```tsx
<span className="px-2 bg-white text-gray-500">{t('divider')}</span>
```

**Verification:**
- [ ] Divider text uses translation
- [ ] Styling unchanged

---

### Task 14: Update Email Field Label and Placeholder
**Estimate:** 1 Story Point
**Priority:** HIGH
**Depends On:** Task 8

**Description:**
Replace the email field label and placeholder with translation calls.

**File:** `/src/components/LoginForm.tsx`
**Location:** Lines 231-232 and 244

**Before (label, lines 231-233):**
```tsx
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
  Email Address
</label>
```

**After:**
```tsx
<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
  {t('form.emailLabel')}
</label>
```

**Before (placeholder, line 244):**
```tsx
placeholder="admin@faqbnb.com"
```

**After:**
```tsx
placeholder={t('form.emailPlaceholder')}
```

**Verification:**
- [ ] Email label uses translation
- [ ] Email placeholder uses translation
- [ ] `htmlFor` association preserved
- [ ] Form field still functions correctly

---

### Task 15: Update Password Field Label and Placeholder
**Estimate:** 1 Story Point
**Priority:** HIGH
**Depends On:** Task 8

**Description:**
Replace the password field label and placeholder with translation calls.

**File:** `/src/components/LoginForm.tsx`
**Location:** Lines 255-257 and 269

**Before (label, lines 255-257):**
```tsx
<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
  Password
</label>
```

**After:**
```tsx
<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
  {t('form.passwordLabel')}
</label>
```

**Before (placeholder, line 269):**
```tsx
placeholder="Enter your password"
```

**After:**
```tsx
placeholder={t('form.passwordPlaceholder')}
```

**Verification:**
- [ ] Password label uses translation
- [ ] Password placeholder uses translation
- [ ] Password visibility toggle unaffected
- [ ] Form field still functions correctly

---

### Task 16: Update Remember Me Checkbox Label
**Estimate:** 0.5 Story Point
**Priority:** HIGH
**Depends On:** Task 8

**Description:**
Replace the remember me checkbox label with a translation call.

**File:** `/src/components/LoginForm.tsx`
**Location:** Lines 303-305

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

**Verification:**
- [ ] Remember me label uses translation
- [ ] Checkbox functionality unchanged
- [ ] `htmlFor` association preserved

---

### Task 17: Update Submit Button Text
**Estimate:** 1 Story Point
**Priority:** HIGH
**Depends On:** Task 8

**Description:**
Replace the submit button text for both loading and normal states with translation calls.

**File:** `/src/components/LoginForm.tsx`
**Location:** Lines 314-324

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

**Key Changes:**
- Line 317: `Signing In...` → `{t('form.submitting')}`
- Line 322: `Sign In with Email` → `{t('form.submitButton')}`

**Verification:**
- [ ] Loading state text uses translation
- [ ] Normal state text uses translation
- [ ] Icons remain in correct position
- [ ] Button functionality unchanged

---

### Task 18: Update Helper Text
**Estimate:** 0.5 Story Point
**Priority:** HIGH
**Depends On:** Task 8

**Description:**
Replace the restricted access helper text with a translation call.

**File:** `/src/components/LoginForm.tsx`
**Location:** Lines 329-331

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

**Verification:**
- [ ] Helper text uses translation
- [ ] Styling unchanged

---

### Task 19: Build Verification
**Estimate:** 1 Story Point
**Priority:** MUST
**Depends On:** All previous tasks

**Description:**
Run the build to verify no TypeScript errors and all translations are properly configured.

**Commands:**
```bash
npm run build
```

**Verification Checklist:**
- [ ] No TypeScript compilation errors
- [ ] No missing translation key warnings
- [ ] Build completes successfully
- [ ] No runtime errors in development mode (`npm run dev`)

---

### Task 20: Manual Testing
**Estimate:** 1 Story Point
**Priority:** MUST
**Depends On:** Task 19

**Description:**
Manually test the LoginForm in all 6 supported languages.

**Test Cases:**

1. **English (default)**
   - [ ] Navigate to `/login`
   - [ ] Verify all text displays correctly in English
   - [ ] Submit empty form - verify validation messages
   - [ ] Submit invalid credentials - verify error messages
   - [ ] Verify OAuth section text
   - [ ] Verify divider text
   - [ ] Verify helper text

2. **French**
   - [ ] Switch language to French
   - [ ] Repeat all English test cases
   - [ ] Verify no English text remains visible

3. **Spanish**
   - [ ] Switch language to Spanish
   - [ ] Repeat all English test cases
   - [ ] Verify no English text remains visible

4. **German**
   - [ ] Switch language to German
   - [ ] Repeat all English test cases
   - [ ] Verify no English text remains visible
   - [ ] Check for text overflow (German text ~30% longer)

5. **Dutch**
   - [ ] Switch language to Dutch
   - [ ] Repeat all English test cases
   - [ ] Verify no English text remains visible

6. **Italian**
   - [ ] Switch language to Italian
   - [ ] Repeat all English test cases
   - [ ] Verify no English text remains visible

**Functional Verification:**
- [ ] Form submission works correctly
- [ ] Validation triggers correctly
- [ ] Password visibility toggle works
- [ ] Remember me checkbox works
- [ ] Google OAuth button works (redirects properly)
- [ ] Successful login redirects to dashboard

---

## Dependency Graph

```
Task 1 (en.json translations)
    ├── Task 2 (fr.json) ──┐
    ├── Task 3 (es.json) ──┤
    ├── Task 4 (de.json) ──┼── Can run in parallel
    ├── Task 5 (nl.json) ──┤
    ├── Task 6 (it.json) ──┘
    │
    └── Task 7 (Add import)
            │
            └── Task 8 (Initialize hook)
                    │
                    ├── Task 9 (Validation messages) ──┐
                    ├── Task 10 (Error messages) ──────┤
                    ├── Task 11 (Error alert) ─────────┤
                    ├── Task 12 (OAuth text) ──────────┤
                    ├── Task 13 (Divider text) ────────┼── Can run in parallel
                    ├── Task 14 (Email field) ─────────┤
                    ├── Task 15 (Password field) ──────┤
                    ├── Task 16 (Remember me) ─────────┤
                    ├── Task 17 (Submit button) ───────┤
                    └── Task 18 (Helper text) ─────────┘
                                    │
                                    └── Task 19 (Build verification)
                                            │
                                            └── Task 20 (Manual testing)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing translation keys at runtime | Build-time verification in Task 19; next-intl shows key name as fallback |
| Text overflow in German/Dutch | Manual testing includes layout verification |
| Breaking form validation | Task 9 includes explicit validation testing |
| Breaking authentication flow | Task 20 includes full functional testing |
| Merge conflicts with parallel work | Translation file structure is additive only |

---

## Acceptance Criteria Verification Matrix

| Acceptance Criterion | Task(s) | Verification Method |
|---------------------|---------|---------------------|
| Component imports useTranslations | Task 7 | Code review |
| Hook initialized with 'auth.login' namespace | Task 8 | Code review |
| Form labels use translation keys | Tasks 14, 15, 16 | Manual testing |
| Placeholders use translation keys | Tasks 14, 15 | Manual testing |
| Validation messages use translation keys | Task 9 | Form validation test |
| Error messages use translation keys | Tasks 10, 11 | Error scenario test |
| Button text uses translation keys | Task 17 | Manual testing |
| OAuth section text uses translation keys | Task 12 | Manual testing |
| Divider text uses translation keys | Task 13 | Manual testing |
| Helper text uses translation keys | Task 18 | Manual testing |
| All 6 language files have translations | Tasks 1-6 | JSON validation |
| Build succeeds without errors | Task 19 | Build log |
| Form functionality maintained | Task 20 | Functional testing |
| No layout breaks in any language | Task 20 | Visual verification |

---

## References

- **Overview Document:** [REQ-356-update-srccomponentsloginformtsx-overview.md](./REQ-356-update-srccomponentsloginformtsx-overview.md)
- **Implementation Plan:** [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- **Pattern Reference:** `/src/components/LogoutButton.tsx` (already internationalized)
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB L10N Epic 2 - Task 2A.3*
*Total Tasks: 20 | Total Estimated Story Points: ~15*
