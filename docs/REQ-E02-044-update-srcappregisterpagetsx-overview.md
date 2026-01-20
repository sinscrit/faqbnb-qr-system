# Implementation Breakdown: REQ-E02-044 - Update Register Page Component for Internationalization

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-044
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.6
**Priority:** P1 - High
**Size:** S (Small)

---

## Overview

This document provides a detailed implementation breakdown for updating the register page components (`/src/app/register/page.tsx` and `/src/app/register/RegistrationPageContent.tsx`) to support internationalization (i18n) using the next-intl library. All hardcoded English strings in these components must be replaced with translation keys from the `auth` namespace to enable multi-language registration page support across all 6 supported languages (English, French, Spanish, German, Dutch, Italian).

---

## Request Summary

### Current Behavior
The register page components contain approximately 50+ hardcoded English strings for:
- Page loading fallback text ("Loading registration page...")
- Loading states ("Checking authentication...", "Validating registration link...", "Completing your registration...")
- Page titles and subtitles ("Create your account", "Complete your registration to access FAQBNB")
- Invalid registration link error messages
- OAuth registration processing messages
- Security notice content
- Footer text and links
- Error state UI text ("Already Registered!", "Try logging in instead")
- Access code verification badge text
- Button labels ("Login", "Go to Home Page", "Back to Home", "Already have an account?", "Request New Access")

Users see registration-related text only in English regardless of their language preference.

### Expected Behavior
All user-facing text in the register page components is retrieved from the translation system using the `auth` namespace. The page displays content in the user's selected language, with fallback to English when translations are unavailable. Page metadata (title, description) is also translated appropriately.

---

## Technical Context

### Component Architecture

The register page uses a two-component architecture:

1. **`/src/app/register/page.tsx`** (Wrapper Component)
   - Client component with `'use client'` directive
   - Wraps content in Suspense boundary
   - Renders fallback loading UI
   - ~23 lines of code, ~2 hardcoded strings

2. **`/src/app/register/RegistrationPageContent.tsx`** (Main Component)
   - Client component with `'use client'` directive
   - Complex component handling multiple registration flows (URL params, manual entry, OAuth)
   - ~926 lines of code, ~50+ hardcoded strings
   - Multiple conditional rendering paths

### Existing Patterns

The codebase already has established patterns for internationalization:

1. **Translation Hook Usage** (from `LogoutButton.tsx`, `GoogleOAuthButton.tsx`):
   ```typescript
   import { useTranslations } from 'next-intl';

   const t = useTranslations('auth');
   const tCommon = useTranslations('common');
   const tErrors = useTranslations('errors');
   ```

2. **Translation File Structure** (`/messages/en.json`):
   - `auth` namespace exists with basic authentication strings
   - `common` namespace exists for shared UI strings
   - `errors` namespace exists for error messages

3. **Component Pattern**:
   - Client components use `'use client'` directive
   - Translation hooks are called at the component level
   - Multiple namespace hooks can be used simultaneously

### Dependencies
- **Epic 1 Foundation**: next-intl setup is complete
- **Translation Files**: `/messages/en.json` with `auth` namespace established
- **REQ-E02-039**: `auth` namespace structure (provides foundation)
- **REQ-E02-042**: RegistrationForm component internationalization (called by this page)

---

## String Inventory

### `/src/app/register/page.tsx` Strings

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Loading registration page..." | Line 11 | `auth.register.loading.page` | Static |

### `/src/app/register/RegistrationPageContent.tsx` Strings

#### Loading States

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Checking authentication..." | Line 541 | `auth.register.loading.checkingAuth` | Static |
| "Validating registration link..." | Line 541 | `auth.register.loading.validatingLink` | Static |
| "Debug: Check console for REGISTRATION_PAGE_DEBUG logs" | Line 543-544 | (Remove - debug only) | Debug |
| "Completing your registration..." | Line 593 | `auth.register.loading.completing` | Static |
| "Please wait while we set up your account." | Line 594 | `auth.register.loading.settingUp` | Static |

#### OAuth Error State

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Already Registered!" | Line 568 | `auth.register.oauthError.alreadyRegistered` | Static |
| "Try logging in instead" | Line 569 | `auth.register.oauthError.tryLogin` | Static |
| "Login" | Line 573 | `common.login` or `auth.signIn` | Static |
| "Go to Home Page" | Line 579 | `common.goToHome` | Static |

#### Invalid Registration Link Page

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "FAQBNB" | Line 689 | `common.brandName` | Static |
| "Registration" | Line 690 | `auth.register.title` | Static |
| "Invalid Registration Link" | Line 694-695 | `auth.register.invalidLink.title` | Static |
| "The registration link you followed is not valid" | Line 697-698 | `auth.register.invalidLink.subtitle` | Static |
| "Registration Link Issues" | Line 709 | `auth.register.invalidLink.issuesTitle` | Static |
| "The following problems were found:" | Line 711 | `auth.register.invalidLink.problemsFound` | Static |
| "Please check your registration email for the correct link, or contact support for assistance." | Line 723 | `auth.register.invalidLink.checkEmail` | Static |
| "Request New Access" | Line 728-729 | `auth.register.invalidLink.requestAccess` | Static |
| "Back to Home" | Line 742 | `common.backToHome` | Static |

#### Valid Registration Page

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "FAQBNB" | Line 764 | `common.brandName` | Static |
| "Account Registration" | Line 765 | `auth.register.accountRegistration` | Static |
| "Create your account" | Line 770-771 | `auth.register.createAccount` | Static |
| "Complete your registration to access FAQBNB" | Line 773-774 | `auth.register.completeRegistration` | Static |
| "Access code verified: {code}..." | Line 780 | `auth.register.accessCodeVerified` | Dynamic |
| "Account created successfully! Redirecting to dashboard..." | Line 814, 853 | `auth.register.success.created` | Static |
| "Back to Home" | Line 886 | `common.backToHome` | Static |
| "Already have an account?" | Line 891 | `auth.hasAccount` | Static |
| "(c) 2024 FAQBNB. All rights reserved." | Line 898 | `common.copyright` | Dynamic |

#### Security Notice

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Secure Registration" | Line 913 | `auth.register.security.title` | Static |
| "Your registration is protected by access code validation. All registration attempts are logged and monitored." | Line 916-918 | `auth.register.security.description` | Static |

#### Error Messages (Dynamic)

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Registration link is invalid: {errors}" | Line 288 | `auth.register.error.invalidLink` | Dynamic |
| "Authentication expired. Please try the registration process again." | Line 462 | `auth.register.error.authExpired` | Static |
| "User already registered. Please try logging in instead." | Line 464 | `auth.register.error.alreadyRegistered` | Static |
| "Invalid registration data. Please check your information." | Line 466 | `auth.register.error.invalidData` | Static |
| "Registration failed: {error}" | Line 468 | `auth.register.error.failed` | Dynamic |
| "OAuth registration failed: {error}. Please try logging in manually at the login page." | Line 499 | `auth.register.error.oauthFailed` | Dynamic |

---

## Implementation Tasks

### Task 1: Update `/src/app/register/page.tsx`

**Effort:** XS
**Description:** Add translation hook and replace the loading fallback text.

**Current Code:**
```typescript
'use client';

import { Suspense } from 'react';
import RegistrationPageContent from './RegistrationPageContent';

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

**Updated Code:**
```typescript
'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import RegistrationPageContent from './RegistrationPageContent';

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

---

### Task 2: Import Translation Hooks in RegistrationPageContent

**Effort:** XS
**Description:** Add the `useTranslations` import and initialize hooks at the component level.

**Changes:**
```typescript
// Add to existing imports (after line 11)
import { useTranslations } from 'next-intl';

// Add inside RegistrationPageContent component, at the beginning (after line 95)
const t = useTranslations('auth.register');
const tAuth = useTranslations('auth');
const tCommon = useTranslations('common');
const tErrors = useTranslations('errors');
```

---

### Task 3: Replace Loading State Strings

**Effort:** S
**Description:** Replace hardcoded loading state texts in multiple locations.

**Location 1: Authentication check loading (Lines 537-548)**
```typescript
// Before
<p className="text-gray-600">
  {authLoading ? 'Checking authentication...' : 'Validating registration link...'}
</p>
<p className="text-xs text-gray-400 mt-2">
  Debug: Check console for REGISTRATION_PAGE_DEBUG logs
</p>

// After
<p className="text-gray-600">
  {authLoading ? t('loading.checkingAuth') : t('loading.validatingLink')}
</p>
```

**Note:** Remove the debug text line entirely as it should not be shown to users.

**Location 2: OAuth completion loading (Lines 589-597)**
```typescript
// Before
<p className="text-gray-600">Completing your registration...</p>
<p className="text-xs text-gray-400 mt-2">Please wait while we set up your account.</p>

// After
<p className="text-gray-600">{t('loading.completing')}</p>
<p className="text-xs text-gray-400 mt-2">{t('loading.settingUp')}</p>
```

---

### Task 4: Replace OAuth Error State Strings

**Effort:** S
**Description:** Replace hardcoded strings in the OAuth processing error state (Lines 562-585).

```typescript
// Before
<h2 className="text-xl font-semibold text-gray-900 mb-2">Already Registered!</h2>
<p className="text-gray-600 mb-6">Try logging in instead</p>
// ...
>Login</Link>
>Go to Home Page</Link>

// After
<h2 className="text-xl font-semibold text-gray-900 mb-2">{t('oauthError.alreadyRegistered')}</h2>
<p className="text-gray-600 mb-6">{t('oauthError.tryLogin')}</p>
// ...
>{tAuth('signIn')}</Link>
>{tCommon('goToHome')}</Link>
```

---

### Task 5: Replace Invalid Registration Link Page Strings

**Effort:** M
**Description:** Replace all hardcoded strings in the invalid registration link error page (Lines 676-747).

**Changes:**
```typescript
// Header section (Lines 688-699)
<h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
<p className="text-sm text-gray-600">{t('title')}</p>
// ...
<h2 className="text-3xl font-bold text-gray-900">
  {t('invalidLink.title')}
</h2>
<p className="mt-2 text-sm text-gray-600">
  {t('invalidLink.subtitle')}
</p>

// Error card section (Lines 707-732)
<h3 className="text-lg font-medium text-gray-900 mb-2">
  {t('invalidLink.issuesTitle')}
</h3>
<p className="mb-2">{t('invalidLink.problemsFound')}</p>
// ...
<p className="text-sm text-gray-600">
  {t('invalidLink.checkEmail')}
</p>
// ...
>{t('invalidLink.requestAccess')}</Link>

// Footer (Lines 737-744)
<Home className="w-4 h-4 mr-1" />
{tCommon('backToHome')}
```

---

### Task 6: Replace Valid Registration Page Strings

**Effort:** M
**Description:** Replace all hardcoded strings in the valid registration page (Lines 751-903).

**Header Section (Lines 763-783):**
```typescript
// Before
<h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
<p className="text-sm text-gray-600">Account Registration</p>
// ...
<h2 className="text-3xl font-bold text-gray-900">
  Create your account
</h2>
<p className="mt-2 text-sm text-gray-600">
  Complete your registration to access FAQBNB
</p>
// ...
Access code verified: {urlParams.code?.substring(0, 4)}...

// After
<h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
<p className="text-sm text-gray-600">{t('accountRegistration')}</p>
// ...
<h2 className="text-3xl font-bold text-gray-900">
  {t('createAccount')}
</h2>
<p className="mt-2 text-sm text-gray-600">
  {t('completeRegistration')}
</p>
// ...
{t('accessCodeVerified', { code: urlParams.code?.substring(0, 4) })}
```

**Success Messages (Lines 813-815, 852-854):**
```typescript
// Before
message: 'Account created successfully! Redirecting to dashboard...'

// After
message: t('success.created')
```

**Footer Section (Lines 880-900):**
```typescript
// Before
<Home className="w-4 h-4 mr-1" />
Back to Home
// ...
Already have an account?
// ...
(c) 2024 FAQBNB. All rights reserved.

// After
<Home className="w-4 h-4 mr-1" />
{tCommon('backToHome')}
// ...
{tAuth('hasAccount')}
// ...
{tCommon('copyright', { year: new Date().getFullYear() })}
```

---

### Task 7: Replace Security Notice Strings

**Effort:** XS
**Description:** Replace hardcoded strings in the security notice section (Lines 906-921).

```typescript
// Before
<h3 className="text-sm font-medium text-gray-800">
  Secure Registration
</h3>
<p className="text-xs text-gray-600 mt-1">
  Your registration is protected by access code validation.
  All registration attempts are logged and monitored.
</p>

// After
<h3 className="text-sm font-medium text-gray-800">
  {t('security.title')}
</h3>
<p className="text-xs text-gray-600 mt-1">
  {t('security.description')}
</p>
```

---

### Task 8: Replace Dynamic Error Messages

**Effort:** S
**Description:** Replace hardcoded error messages used in setMessage calls throughout the component.

**Location 1: Invalid URL parameters (Line 288):**
```typescript
// Before
message: `Registration link is invalid: ${errors.join(', ')}`

// After
message: t('error.invalidLink', { errors: errors.join(', ') })
```

**Location 2: OAuth API error handling (Lines 459-474):**
```typescript
// Before
if (response.status === 401) {
  userFriendlyMessage = 'Authentication expired. Please try the registration process again.';
} else if (response.status === 409) {
  userFriendlyMessage = 'User already registered. Please try logging in instead.';
} else if (response.status === 400) {
  userFriendlyMessage = 'Invalid registration data. Please check your information.';
} else if (result.error) {
  userFriendlyMessage = `Registration failed: ${result.error}`;
}

// After
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

**Location 3: OAuth exception handler (Line 499):**
```typescript
// Before
message: `OAuth registration failed: ${errorMessage}. Please try logging in manually at the login page.`

// After
message: t('error.oauthFailed', { error: errorMessage })
```

---

### Task 9: Update Translation Files

**Effort:** M
**Description:** Add all new translation keys to `/messages/en.json` under the `auth.register` namespace.

**New Keys Structure:**
```json
{
  "auth": {
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
        "authExpired": "Authentication expired. Please try the registration process again.",
        "alreadyRegistered": "User already registered. Please try logging in instead.",
        "invalidData": "Invalid registration data. Please check your information.",
        "failed": "Registration failed: {error}",
        "oauthFailed": "OAuth registration failed: {error}. Please try logging in manually at the login page."
      }
    }
  },
  "common": {
    "brandName": "FAQBNB",
    "backToHome": "Back to Home",
    "goToHome": "Go to Home Page",
    "login": "Login",
    "copyright": "(c) {year} FAQBNB. All rights reserved."
  }
}
```

---

### Task 10: Verification Testing

**Effort:** S
**Description:** Verify the component renders correctly in all supported languages.

**Test Cases:**
1. Load the registration page in each of the 6 supported languages
2. Verify loading state text displays correctly
3. Test with invalid URL parameters - verify error page is translated
4. Test with valid URL parameters - verify registration page is translated
5. Test OAuth registration flow - verify processing and error states are translated
6. Verify security notice displays correctly
7. Verify all footer links and copyright display correctly
8. Verify error messages from API responses display correctly

---

## Authorized Files and Functions for Modification

### Primary Component Files
| File | Purpose | Modifications Allowed |
|------|---------|----------------------|
| `/src/app/register/page.tsx` | Registration page wrapper with loading fallback | Add imports, modify hardcoded strings to use translation hooks |
| `/src/app/register/RegistrationPageContent.tsx` | Main registration page component | Add imports, modify all ~50 hardcoded strings to use translation hooks |

### Translation Files
| File | Purpose | Modifications Allowed |
|------|---------|----------------------|
| `/messages/en.json` | English translations | Add new keys under `auth.register` and `common` namespaces |
| `/messages/fr.json` | French translations | Add translations (handled by separate task) |
| `/messages/es.json` | Spanish translations | Add translations (handled by separate task) |
| `/messages/de.json` | German translations | Add translations (handled by separate task) |
| `/messages/nl.json` | Dutch translations | Add translations (handled by separate task) |
| `/messages/it.json` | Italian translations | Add translations (handled by separate task) |

### Functions to Modify

| Function/Component | File | Line Numbers | Modification |
|-------------------|------|--------------|--------------|
| `RegistrationPageFallback` | page.tsx | 6-15 | Add translation hook, replace loading text |
| `RegistrationPage` | page.tsx | 17-23 | No changes needed |
| `RegistrationPageContent` | RegistrationPageContent.tsx | 92-925 | Add translation hooks at component level |
| Loading state JSX | RegistrationPageContent.tsx | 528-548 | Replace loading messages |
| OAuth error state JSX | RegistrationPageContent.tsx | 560-598 | Replace error/processing messages |
| `MessageAlert` component | RegistrationPageContent.tsx | 600-671 | No changes (renders dynamic message prop) |
| Invalid link error JSX | RegistrationPageContent.tsx | 674-748 | Replace all hardcoded strings |
| Valid registration JSX | RegistrationPageContent.tsx | 750-924 | Replace all hardcoded strings |
| Error handling in OAuth effect | RegistrationPageContent.tsx | 459-502 | Replace error message strings |

---

## Implementation Checklist

- [ ] Import `useTranslations` hook in `/src/app/register/page.tsx`
- [ ] Initialize translation hook in `RegistrationPageFallback` component
- [ ] Replace loading fallback text in page.tsx
- [ ] Import `useTranslations` hook in `RegistrationPageContent.tsx`
- [ ] Initialize `t`, `tAuth`, `tCommon`, `tErrors` hooks at component level
- [ ] Replace loading state strings (authentication check)
- [ ] Remove debug text from loading state
- [ ] Replace OAuth completion loading strings
- [ ] Replace OAuth error state strings
- [ ] Replace invalid registration link page strings (title, subtitle)
- [ ] Replace invalid registration link error card strings
- [ ] Replace invalid registration link footer strings
- [ ] Replace valid registration page header strings
- [ ] Replace access code verified badge text
- [ ] Replace success message strings
- [ ] Replace footer navigation strings
- [ ] Replace copyright text with dynamic year
- [ ] Replace security notice strings
- [ ] Replace dynamic error messages in setMessage calls
- [ ] Add new keys to `/messages/en.json` under `auth.register`
- [ ] Add new common keys to `/messages/en.json`
- [ ] Verify page displays correctly in all 6 supported languages
- [ ] Test invalid URL parameter flow
- [ ] Test valid URL parameter flow
- [ ] Test OAuth registration flow

---

## Dependencies

### Blocking Dependencies
- REQ-E02-039: `auth` namespace structure must exist in translation files

### Non-Blocking Dependencies
- REQ-E02-042: `RegistrationForm` component internationalization (child component)
- Translation generation tasks for non-English languages (handled separately)

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Multiple rendering paths may miss some strings | Medium | Thorough testing of all registration flows |
| Error messages in callbacks may expect specific format | Low | Error messages are displayed as-is, translation is transparent |
| Debug console logs contain hardcoded strings | None | Debug logs are not user-facing, leave as-is |
| Dynamic year in copyright | Low | Use interpolation with `{ year: new Date().getFullYear() }` |
| Component complexity with multiple effects | Low | Only modify JSX strings, leave logic unchanged |

---

## Acceptance Criteria

From REQ-E02-044:
- [ ] All user-facing text in the register page component is retrieved from the translation system using the `auth` namespace
- [ ] The page displays content in the user's selected language
- [ ] Fallback to English works when translations are unavailable
- [ ] Page titles and metadata are translated appropriately
- [ ] Loading states display in the correct language
- [ ] Error messages display in the correct language
- [ ] Success messages display in the correct language
- [ ] Security notice displays in the correct language
- [ ] Footer text and navigation links display in the correct language
- [ ] Dynamic values (access code preview, year) are properly interpolated

---

## Effort Estimate

| Task | Effort |
|------|--------|
| Import and initialize hooks (both files) | XS |
| Replace loading state strings | S |
| Replace OAuth error state strings | S |
| Replace invalid link page strings | M |
| Replace valid registration page strings | M |
| Replace security notice strings | XS |
| Replace dynamic error messages | S |
| Update translation files | M |
| Testing | S |
| **Total** | **S (Small)** |

Estimated time: 1-1.5 hours for implementation, 30-45 minutes for testing.

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-044
- [Pattern Reference: GoogleOAuthButton.tsx Overview](/docs/REQ-E02-043-update-srccomponentsgoogleoauthbuttontsx-overview.md)
- [Pattern Reference: LoginForm.tsx Overview](/docs/REQ-E02-041-update-srccomponentsloginformtsx-overview.md)
- [Translation File: en.json](/messages/en.json)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A: Authentication & Registration*
