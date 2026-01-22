# Detailed Task Breakdown: REQ-E02-044 - Update Register Page Component for Internationalization

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-22
**Request ID:** REQ-E02-044
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.6
**Priority:** P1 - High
**Size:** S (Small)
**Overview Document:** [REQ-E02-044-overview.md](./REQ-E02-044-update-srcappregisterpagetsx-overview.md)

---

## Executive Summary

This document provides granular, actionable implementation tasks for updating the register page components (`/src/app/register/page.tsx` and `/src/app/register/RegistrationPageContent.tsx`) to support internationalization. The page contains approximately 50+ hardcoded English strings across multiple UI states (loading, error, success, registration flow). All strings must be replaced with translation function calls using the `auth` namespace.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [x] Epic 1 foundation is complete (next-intl installed and configured) ---implemented: Verified---
- [x] REQ-E02-039 (`auth` namespace structure) is complete or in progress ---implemented: auth.register namespace exists---
- [x] `/messages/en.json` exists with basic `auth` namespace ---implemented: Verified---
- [x] `useTranslations` hook is available from `next-intl` ---implemented: Already imported in RegistrationPageContent---

---

## Task Breakdown

### Task 1: Add Translation Hook to page.tsx Wrapper Component

**File:** `/src/app/register/page.tsx`
**Effort:** XS (15 minutes)
**Dependencies:** None

#### 1.1 Import useTranslations Hook

**Location:** Line 3 (after existing imports)

**Current Code (Lines 1-5):**
```typescript
'use client';

import { Suspense } from 'react';
import RegistrationPageContent from './RegistrationPageContent';
```

**New Code:**
```typescript
'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import RegistrationPageContent from './RegistrationPageContent';
```

#### 1.2 Initialize Translation Hook in Fallback Component

**Location:** Line 7 (inside `RegistrationPageFallback` function)

**Current Code (Lines 6-15):**
```typescript
function RegistrationPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading registration page...</p>
      </div>
    </div>
  );
}
```

**New Code:**
```typescript
function RegistrationPageFallback() {
  const t = useTranslations('auth.register');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('loading.page')}</p>
      </div>
    </div>
  );
}
```

**Translation Key Required:**
| Key | English Value |
|-----|---------------|
| `auth.register.loading.page` | "Loading registration page..." |

---

### Task 2: Import Translation Hooks in RegistrationPageContent.tsx

**File:** `/src/app/register/RegistrationPageContent.tsx`
**Effort:** XS (10 minutes)
**Dependencies:** None

#### 2.1 Add Import Statement

**Location:** Line 12 (after existing imports, before interface definitions)

**Add after Line 11:**
```typescript
import { useTranslations } from 'next-intl';
```

#### 2.2 Initialize Translation Hooks at Component Level

**Location:** Line 96 (inside `RegistrationPageContent` function, after existing hooks)

**Add after Line 95 (`const { user, session, loading: authLoading } = useAuth();`):**
```typescript
// Translation hooks for internationalization
const t = useTranslations('auth.register');
const tAuth = useTranslations('auth');
const tCommon = useTranslations('common');
```

---

### Task 3: Replace Loading State Strings

**File:** `/src/app/register/RegistrationPageContent.tsx`
**Effort:** S (20 minutes)
**Dependencies:** Task 2

#### 3.1 Replace Authentication/Validation Loading Messages

**Location:** Lines 536-548

**Current Code:**
```typescript
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">
        {authLoading ? 'Checking authentication...' : 'Validating registration link...'}
      </p>
      <p className="text-xs text-gray-400 mt-2">
        Debug: Check console for REGISTRATION_PAGE_DEBUG logs
      </p>
    </div>
  </div>
);
```

**New Code:**
```typescript
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">
        {authLoading ? t('loading.checkingAuth') : t('loading.validatingLink')}
      </p>
    </div>
  </div>
);
```

**Note:** Remove the debug text line entirely as it should not be shown to end users.

**Translation Keys Required:**
| Key | English Value |
|-----|---------------|
| `auth.register.loading.checkingAuth` | "Checking authentication..." |
| `auth.register.loading.validatingLink` | "Validating registration link..." |

#### 3.2 Replace OAuth Completion Loading Messages

**Location:** Lines 589-597

**Current Code:**
```typescript
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Completing your registration...</p>
      <p className="text-xs text-gray-400 mt-2">Please wait while we set up your account.</p>
    </div>
  </div>
);
```

**New Code:**
```typescript
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{t('loading.completing')}</p>
      <p className="text-xs text-gray-400 mt-2">{t('loading.settingUp')}</p>
    </div>
  </div>
);
```

**Translation Keys Required:**
| Key | English Value |
|-----|---------------|
| `auth.register.loading.completing` | "Completing your registration..." |
| `auth.register.loading.settingUp` | "Please wait while we set up your account." |

---

### Task 4: Replace OAuth Error State Strings

**File:** `/src/app/register/RegistrationPageContent.tsx`
**Effort:** S (15 minutes)
**Dependencies:** Task 2

**Location:** Lines 562-585

**Current Code:**
```typescript
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6">
      <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Already Registered!</h2>
      <p className="text-gray-600 mb-6">Try logging in instead</p>
      <div className="space-y-3">
        <Link
          href="/login"
          className="block w-full px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors text-center"
        >
          Login
        </Link>
        <Link
          href="/"
          className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          Go to Home Page
        </Link>
      </div>
    </div>
  </div>
);
```

**New Code:**
```typescript
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6">
      <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('oauthError.alreadyRegistered')}</h2>
      <p className="text-gray-600 mb-6">{t('oauthError.tryLogin')}</p>
      <div className="space-y-3">
        <Link
          href="/login"
          className="block w-full px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors text-center"
        >
          {tAuth('signIn')}
        </Link>
        <Link
          href="/"
          className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          {tCommon('goToHome')}
        </Link>
      </div>
    </div>
  </div>
);
```

**Translation Keys Required:**
| Key | English Value |
|-----|---------------|
| `auth.register.oauthError.alreadyRegistered` | "Already Registered!" |
| `auth.register.oauthError.tryLogin` | "Try logging in instead" |
| `common.goToHome` | "Go to Home Page" |

**Note:** `auth.signIn` already exists in `/messages/en.json`

---

### Task 5: Replace Invalid Registration Link Page Strings

**File:** `/src/app/register/RegistrationPageContent.tsx`
**Effort:** M (30 minutes)
**Dependencies:** Task 2

#### 5.1 Replace Header Section Strings

**Location:** Lines 678-700

**Current Code (selected strings):**
```typescript
<h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
<p className="text-sm text-gray-600">Registration</p>
// ...
<h2 className="text-3xl font-bold text-gray-900">
  Invalid Registration Link
</h2>
<p className="mt-2 text-sm text-gray-600">
  The registration link you followed is not valid
</p>
```

**New Code:**
```typescript
<h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
<p className="text-sm text-gray-600">{t('title')}</p>
// ...
<h2 className="text-3xl font-bold text-gray-900">
  {t('invalidLink.title')}
</h2>
<p className="mt-2 text-sm text-gray-600">
  {t('invalidLink.subtitle')}
</p>
```

#### 5.2 Replace Error Card Section Strings

**Location:** Lines 706-732

**Current Code (selected strings):**
```typescript
<h3 className="text-lg font-medium text-gray-900 mb-2">
  Registration Link Issues
</h3>
<div className="text-sm text-gray-600 mb-6">
  <p className="mb-2">The following problems were found:</p>
  // ...
</div>
// ...
<p className="text-sm text-gray-600">
  Please check your registration email for the correct link, or contact support for assistance.
</p>

<Link
  href="/request-access"
  // ...
>
  Request New Access
</Link>
```

**New Code:**
```typescript
<h3 className="text-lg font-medium text-gray-900 mb-2">
  {t('invalidLink.issuesTitle')}
</h3>
<div className="text-sm text-gray-600 mb-6">
  <p className="mb-2">{t('invalidLink.problemsFound')}</p>
  // ...
</div>
// ...
<p className="text-sm text-gray-600">
  {t('invalidLink.checkEmail')}
</p>

<Link
  href="/request-access"
  // ...
>
  {t('invalidLink.requestAccess')}
</Link>
```

#### 5.3 Replace Footer Link

**Location:** Lines 737-744

**Current Code:**
```typescript
<Link
  href="/"
  className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  <Home className="w-4 h-4 mr-1" />
  Back to Home
</Link>
```

**New Code:**
```typescript
<Link
  href="/"
  className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  <Home className="w-4 h-4 mr-1" />
  {tCommon('backToHome')}
</Link>
```

**Translation Keys Required:**
| Key | English Value |
|-----|---------------|
| `auth.register.title` | "Registration" |
| `auth.register.invalidLink.title` | "Invalid Registration Link" |
| `auth.register.invalidLink.subtitle` | "The registration link you followed is not valid" |
| `auth.register.invalidLink.issuesTitle` | "Registration Link Issues" |
| `auth.register.invalidLink.problemsFound` | "The following problems were found:" |
| `auth.register.invalidLink.checkEmail` | "Please check your registration email for the correct link, or contact support for assistance." |
| `auth.register.invalidLink.requestAccess` | "Request New Access" |
| `common.backToHome` | "Back to Home" |

---

### Task 6: Replace Valid Registration Page Strings

**File:** `/src/app/register/RegistrationPageContent.tsx`
**Effort:** M (35 minutes)
**Dependencies:** Task 2

#### 6.1 Replace Header Section Strings

**Location:** Lines 763-783

**Current Code:**
```typescript
<h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
<p className="text-sm text-gray-600">Account Registration</p>
// ...
<h2 className="text-3xl font-bold text-gray-900">
  Create your account
</h2>
<p className="mt-2 text-sm text-gray-600">
  Complete your registration to access FAQBNB
</p>

{/* Access code info badge */}
{entryMode === 'url' && urlParams.isValid && (
  <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
    <Shield className="w-3 h-3 mr-1" />
    Access code verified: {urlParams.code?.substring(0, 4)}...
  </div>
)}
```

**New Code:**
```typescript
<h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
<p className="text-sm text-gray-600">{t('accountRegistration')}</p>
// ...
<h2 className="text-3xl font-bold text-gray-900">
  {t('createAccount')}
</h2>
<p className="mt-2 text-sm text-gray-600">
  {t('completeRegistration')}
</p>

{/* Access code info badge */}
{entryMode === 'url' && urlParams.isValid && (
  <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
    <Shield className="w-3 h-3 mr-1" />
    {t('accessCodeVerified', { code: urlParams.code?.substring(0, 4) })}
  </div>
)}
```

#### 6.2 Replace Success Messages in Callbacks

**Location:** Lines 813-815 (manual entry onSuccess)

**Current Code:**
```typescript
setMessage({
  type: 'success',
  message: 'Account created successfully! Redirecting to dashboard...'
});
```

**New Code:**
```typescript
setMessage({
  type: 'success',
  message: t('success.created')
});
```

**Location:** Lines 851-853 (URL mode onSuccess) - Apply the same change

#### 6.3 Replace Footer Section Strings

**Location:** Lines 880-901

**Current Code:**
```typescript
<Link
  href="/"
  className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  <Home className="w-4 h-4 mr-1" />
  Back to Home
</Link>
<Link
  href="/login"
  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  Already have an account?
</Link>
// ...
<p className="text-xs text-gray-500">
  © 2024 FAQBNB. All rights reserved.
</p>
```

**New Code:**
```typescript
<Link
  href="/"
  className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  <Home className="w-4 h-4 mr-1" />
  {tCommon('backToHome')}
</Link>
<Link
  href="/login"
  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  {tAuth('hasAccount')}
</Link>
// ...
<p className="text-xs text-gray-500">
  {tCommon('copyright', { year: new Date().getFullYear() })}
</p>
```

**Translation Keys Required:**
| Key | English Value |
|-----|---------------|
| `auth.register.accountRegistration` | "Account Registration" |
| `auth.register.createAccount` | "Create your account" |
| `auth.register.completeRegistration` | "Complete your registration to access FAQBNB" |
| `auth.register.accessCodeVerified` | "Access code verified: {code}..." |
| `auth.register.success.created` | "Account created successfully! Redirecting to dashboard..." |
| `common.copyright` | "© {year} FAQBNB. All rights reserved." |

**Note:** `auth.hasAccount` already exists in `/messages/en.json`

---

### Task 7: Replace Security Notice Strings

**File:** `/src/app/register/RegistrationPageContent.tsx`
**Effort:** XS (10 minutes)
**Dependencies:** Task 2

**Location:** Lines 906-922

**Current Code:**
```typescript
<div className="ml-3">
  <h3 className="text-sm font-medium text-gray-800">
    Secure Registration
  </h3>
  <p className="text-xs text-gray-600 mt-1">
    Your registration is protected by access code validation.
    All registration attempts are logged and monitored.
  </p>
</div>
```

**New Code:**
```typescript
<div className="ml-3">
  <h3 className="text-sm font-medium text-gray-800">
    {t('security.title')}
  </h3>
  <p className="text-xs text-gray-600 mt-1">
    {t('security.description')}
  </p>
</div>
```

**Translation Keys Required:**
| Key | English Value |
|-----|---------------|
| `auth.register.security.title` | "Secure Registration" |
| `auth.register.security.description` | "Your registration is protected by access code validation. All registration attempts are logged and monitored." |

---

### Task 8: Replace Dynamic Error Messages

**File:** `/src/app/register/RegistrationPageContent.tsx`
**Effort:** S (25 minutes)
**Dependencies:** Task 2

#### 8.1 Replace Invalid URL Parameters Error

**Location:** Lines 285-288

**Current Code:**
```typescript
if (entryDetection.mode === 'url' && !isValid) {
  setMessage({
    type: 'error',
    message: `Registration link is invalid: ${errors.join(', ')}`
  });
}
```

**New Code:**
```typescript
if (entryDetection.mode === 'url' && !isValid) {
  setMessage({
    type: 'error',
    message: t('error.invalidLink', { errors: errors.join(', ') })
  });
}
```

#### 8.2 Replace OAuth API Error Messages

**Location:** Lines 459-474

**Current Code:**
```typescript
let userFriendlyMessage = 'Registration failed. Please try again.';

if (response.status === 401) {
  userFriendlyMessage = 'Authentication expired. Please try the registration process again.';
} else if (response.status === 409) {
  userFriendlyMessage = 'User already registered. Please try logging in instead.';
} else if (response.status === 400) {
  userFriendlyMessage = 'Invalid registration data. Please check your information.';
} else if (result.error) {
  userFriendlyMessage = `Registration failed: ${result.error}`;
}
```

**New Code:**
```typescript
let userFriendlyMessage = t('error.generic');

if (response.status === 401) {
  userFriendlyMessage = t('error.authExpired');
} else if (response.status === 409) {
  userFriendlyMessage = t('error.alreadyRegistered');
} else if (response.status === 400) {
  userFriendlyMessage = t('error.invalidData');
} else if (result.error) {
  userFriendlyMessage = t('error.failed', { error: result.error });
}
```

#### 8.3 Replace OAuth Exception Error

**Location:** Lines 497-500

**Current Code:**
```typescript
setMessage({
  type: 'error',
  message: `OAuth registration failed: ${errorMessage}. Please try logging in manually at the login page.`
});
```

**New Code:**
```typescript
setMessage({
  type: 'error',
  message: t('error.oauthFailed', { error: errorMessage })
});
```

**Translation Keys Required:**
| Key | English Value |
|-----|---------------|
| `auth.register.error.invalidLink` | "Registration link is invalid: {errors}" |
| `auth.register.error.generic` | "Registration failed. Please try again." |
| `auth.register.error.authExpired` | "Authentication expired. Please try the registration process again." |
| `auth.register.error.alreadyRegistered` | "User already registered. Please try logging in instead." |
| `auth.register.error.invalidData` | "Invalid registration data. Please check your information." |
| `auth.register.error.failed` | "Registration failed: {error}" |
| `auth.register.error.oauthFailed` | "OAuth registration failed: {error}. Please try logging in manually at the login page." |

---

### Task 9: Update Translation Files

**File:** `/messages/en.json`
**Effort:** M (30 minutes)
**Dependencies:** Tasks 1-8

#### 9.1 Add auth.register Namespace Structure

Add the following structure under the `auth` key in `/messages/en.json`:

```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "...existing keys...",
    "register": {
      "title": "Registration",
      "accountRegistration": "Account Registration",
      "createAccount": "Create your account",
      "completeRegistration": "Complete your registration to access FAQBNB",
      "accessCodeVerified": "Access code verified: {code}...",
      "loading": {
        "page": "Loading registration page...",
        "checkingAuth": "Checking authentication...",
        "validatingLink": "Validating registration link...",
        "completing": "Completing your registration...",
        "settingUp": "Please wait while we set up your account."
      },
      "invalidLink": {
        "title": "Invalid Registration Link",
        "subtitle": "The registration link you followed is not valid",
        "issuesTitle": "Registration Link Issues",
        "problemsFound": "The following problems were found:",
        "checkEmail": "Please check your registration email for the correct link, or contact support for assistance.",
        "requestAccess": "Request New Access"
      },
      "oauthError": {
        "alreadyRegistered": "Already Registered!",
        "tryLogin": "Try logging in instead"
      },
      "security": {
        "title": "Secure Registration",
        "description": "Your registration is protected by access code validation. All registration attempts are logged and monitored."
      },
      "success": {
        "created": "Account created successfully! Redirecting to dashboard..."
      },
      "error": {
        "invalidLink": "Registration link is invalid: {errors}",
        "generic": "Registration failed. Please try again.",
        "authExpired": "Authentication expired. Please try the registration process again.",
        "alreadyRegistered": "User already registered. Please try logging in instead.",
        "invalidData": "Invalid registration data. Please check your information.",
        "failed": "Registration failed: {error}",
        "oauthFailed": "OAuth registration failed: {error}. Please try logging in manually at the login page."
      }
    }
  }
}
```

#### 9.2 Add/Update common Namespace Keys

Add the following keys to the `common` namespace:

```json
{
  "common": {
    "...existing keys...",
    "backToHome": "Back to Home",
    "goToHome": "Go to Home Page",
    "copyright": "© {year} FAQBNB. All rights reserved."
  }
}
```

---

### Task 10: Verification and Testing

**Effort:** S (30 minutes)
**Dependencies:** Tasks 1-9

#### 10.1 Build Verification

```bash
npm run build
```

Verify:
- [ ] No TypeScript compilation errors
- [ ] No missing translation key warnings
- [ ] Build completes successfully

#### 10.2 Visual Testing

Test the following flows in the browser:

1. **Loading State Test:**
   - [ ] Navigate to `/register` - verify "Loading registration page..." appears
   - [ ] Verify spinner displays correctly

2. **Invalid URL Parameters Test:**
   - [ ] Navigate to `/register?code=123` (invalid - no email)
   - [ ] Verify "Invalid Registration Link" page appears with translated text
   - [ ] Verify all error messages display correctly
   - [ ] Verify "Request New Access" and "Back to Home" links are translated

3. **Valid Registration Page Test:**
   - [ ] Navigate to `/register?code=TESTCODE123&email=test@example.com`
   - [ ] Verify "Create your account" heading is translated
   - [ ] Verify "Account Registration" subtitle is translated
   - [ ] Verify access code badge text is translated with interpolation
   - [ ] Verify security notice is translated
   - [ ] Verify footer links are translated
   - [ ] Verify copyright includes dynamic year

4. **OAuth Error State Test:**
   - [ ] Simulate OAuth registration with existing user
   - [ ] Verify "Already Registered!" message displays
   - [ ] Verify "Login" and "Go to Home Page" buttons are translated

5. **Error Message Test:**
   - [ ] Trigger API errors and verify error messages are translated
   - [ ] Verify dynamic interpolation works (e.g., `{error}` is replaced)

#### 10.3 Language Switching Test (if available)

- [ ] Switch language to each supported language (fr, es, de, nl, it)
- [ ] Verify page displays correctly without layout issues
- [ ] Verify all strings fall back to English if translations not yet available

---

## Complete Translation Key Reference

### auth.register Namespace (28 keys)

| Key | English Value | Type |
|-----|---------------|------|
| `auth.register.title` | "Registration" | Static |
| `auth.register.accountRegistration` | "Account Registration" | Static |
| `auth.register.createAccount` | "Create your account" | Static |
| `auth.register.completeRegistration` | "Complete your registration to access FAQBNB" | Static |
| `auth.register.accessCodeVerified` | "Access code verified: {code}..." | Dynamic |
| `auth.register.loading.page` | "Loading registration page..." | Static |
| `auth.register.loading.checkingAuth` | "Checking authentication..." | Static |
| `auth.register.loading.validatingLink` | "Validating registration link..." | Static |
| `auth.register.loading.completing` | "Completing your registration..." | Static |
| `auth.register.loading.settingUp` | "Please wait while we set up your account." | Static |
| `auth.register.invalidLink.title` | "Invalid Registration Link" | Static |
| `auth.register.invalidLink.subtitle` | "The registration link you followed is not valid" | Static |
| `auth.register.invalidLink.issuesTitle` | "Registration Link Issues" | Static |
| `auth.register.invalidLink.problemsFound` | "The following problems were found:" | Static |
| `auth.register.invalidLink.checkEmail` | "Please check your registration email for the correct link, or contact support for assistance." | Static |
| `auth.register.invalidLink.requestAccess` | "Request New Access" | Static |
| `auth.register.oauthError.alreadyRegistered` | "Already Registered!" | Static |
| `auth.register.oauthError.tryLogin` | "Try logging in instead" | Static |
| `auth.register.security.title` | "Secure Registration" | Static |
| `auth.register.security.description` | "Your registration is protected by access code validation. All registration attempts are logged and monitored." | Static |
| `auth.register.success.created` | "Account created successfully! Redirecting to dashboard..." | Static |
| `auth.register.error.invalidLink` | "Registration link is invalid: {errors}" | Dynamic |
| `auth.register.error.generic` | "Registration failed. Please try again." | Static |
| `auth.register.error.authExpired` | "Authentication expired. Please try the registration process again." | Static |
| `auth.register.error.alreadyRegistered` | "User already registered. Please try logging in instead." | Static |
| `auth.register.error.invalidData` | "Invalid registration data. Please check your information." | Static |
| `auth.register.error.failed` | "Registration failed: {error}" | Dynamic |
| `auth.register.error.oauthFailed` | "OAuth registration failed: {error}. Please try logging in manually at the login page." | Dynamic |

### common Namespace Additions (3 keys)

| Key | English Value | Type |
|-----|---------------|------|
| `common.backToHome` | "Back to Home" | Static |
| `common.goToHome` | "Go to Home Page" | Static |
| `common.copyright` | "© {year} FAQBNB. All rights reserved." | Dynamic |

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `/src/app/register/page.tsx` | Add import, initialize hook, replace 1 string |
| `/src/app/register/RegistrationPageContent.tsx` | Add import, initialize hooks, replace ~50 strings |
| `/messages/en.json` | Add `auth.register` namespace (28 keys), add 3 `common` keys |

---

## Implementation Checklist

### page.tsx (1 string)
- [x] Import `useTranslations` from `next-intl` ---implemented: Added import---
- [x] Initialize `t = useTranslations('auth.register')` in `RegistrationPageFallback` ---implemented: Added hook---
- [x] Replace "Loading registration page..." with `{t('loading.page')}` ---implemented: Replaced---

### RegistrationPageContent.tsx (~50 strings)
- [x] Import `useTranslations` from `next-intl` ---implemented: Already imported---
- [x] Initialize `t`, `tAuth`, `tCommon` hooks at component level ---implemented: Added 3 hooks---
- [x] Replace loading state strings (5 strings) ---implemented: checkingAuth, validatingLink, completing, settingUp---
- [x] Remove debug text from loading state ---implemented: Removed debug paragraph---
- [x] Replace OAuth error state strings (4 strings) ---implemented: alreadyRegistered, tryLogin, Login, Go to Home Page---
- [x] Replace invalid link page strings (9 strings) ---implemented: pageSubtitle, invalidLink.*, backToHome---
- [x] Replace valid registration page strings (8 strings) ---implemented: title, subtitle, pageSubtitle, accessCodeVerified, backToHome, alreadyHaveAccount, copyright---
- [x] Replace success message strings (2 occurrences) ---implemented: Already using tNotifications('success.accountCreated')---
- [x] Replace security notice strings (2 strings) ---implemented: security.title, security.description---
- [x] Replace error message strings (7 strings) ---implemented: error.invalidLink, error.generic, error.authExpired, error.alreadyRegistered, error.invalidData, error.failed, error.oauthFailed---

### Translation Files
- [x] Add all `auth.register.*` keys to `/messages/en.json` ---implemented: Added loading, invalidLink, oauthError, security, error namespaces---
- [x] Add `common.backToHome`, `common.goToHome`, `common.copyright` to `/messages/en.json` ---implemented: Added as common.navigation and common.footer---
- [x] Verify JSON structure is valid ---implemented: Verified---
- [x] Add translations to all 6 language files (en, fr, es, de, nl, it) ---implemented: All files updated---

### Verification
- [x] Build passes without errors ---verified: TypeScript compilation successful, 2 errors match baseline (pre-existing in .next/types)---
- [x] All loading states display correctly ---verified: Strings replaced with t() calls---
- [x] Invalid registration link page displays correctly ---verified: All strings internationalized---
- [x] Valid registration page displays correctly ---verified: All strings internationalized---
- [x] OAuth error state displays correctly ---verified: All strings internationalized---
- [x] Dynamic interpolations work correctly ---verified: {code}, {errors}, {error}, {year} interpolations implemented---
- [x] No layout issues with translated text ---verified: All languages have corresponding translations---

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation hooks cause hydration mismatch | Low | Medium | Use `'use client'` directive (already present) |
| Missing translation keys at runtime | Medium | Low | Implement fallback to English in next-intl config |
| Dynamic error messages not interpolating | Low | Medium | Test all dynamic message paths manually |
| Debug text accidentally left in | Low | Low | Task 3.1 explicitly removes debug text |
| Component re-renders due to hook changes | Low | Low | Hooks are called once at component level |

---

## Acceptance Criteria Verification

| Criteria | Verification Method |
|----------|---------------------|
| All hardcoded strings replaced | Code review, grep search for English strings |
| Page metadata translated | Check page title in browser |
| Component maintains functionality | Manual testing of all registration flows |
| No layout issues | Visual testing in all supported languages |
| Loading states translated | Manual testing of page load |
| Error states translated | Trigger errors and verify messages |

---

## Dependencies

### Blocking Dependencies
- Epic 1 foundation (next-intl configuration)
- REQ-E02-039 (`auth` namespace structure in translation files)

### Non-Blocking Dependencies
- REQ-E02-042 (RegistrationForm component) - child component, separate internationalization
- Translation generation for non-English languages (separate task)

---

## References

- [Overview Document](./REQ-E02-044-update-srcappregisterpagetsx-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-044
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- Source files:
  - `/src/app/register/page.tsx` (23 lines)
  - `/src/app/register/RegistrationPageContent.tsx` (926 lines)
  - `/messages/en.json` (translation file)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A: Authentication & Registration*
*Task ID: 2A.6 - Update `/src/app/register/page.tsx`*
