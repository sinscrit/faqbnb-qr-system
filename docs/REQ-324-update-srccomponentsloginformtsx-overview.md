# REQ-324: Internationalize LoginForm Component - Implementation Overview

**Created:** 2026-01-18 23:45:00 UTC
**Last Modified:** 2026-01-18 23:45:00 UTC
**Request Reference:** gen_requests_epic2.md - Request #324
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.3
**Priority:** High (Third in Sub-Epic 2A sequence, after LoginPageContent)

---

## Executive Summary

This document provides the implementation breakdown for internationalizing the `LoginForm` component located at `/src/components/LoginForm.tsx`. The component contains approximately **30 hardcoded English strings** that need to be extracted and replaced with translation function calls using the `next-intl` framework. This task is part of Sub-Epic 2A (Authentication & Registration) and completes the login form localization when combined with REQ-323 (LoginPageContent).

---

## Dependencies

### Prerequisites (Must Be Completed First)

| Dependency | Status | Description |
|------------|--------|-------------|
| **Epic 1: L10N Foundation** | Required | `next-intl` package installation, i18n configuration, IntlProvider setup |
| **Task 2H.1: Common Namespace** | Required | Base `common` namespace in `/messages/en.json` for shared strings |
| **Task 2A.1: Auth Namespace (REQ-322)** | Required | `auth` namespace structure in `/messages/en.json` |
| **Task 2A.2: LoginPageContent (REQ-323)** | Recommended | Parent component should be internationalized first |

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
`/src/components/LoginForm.tsx` (336 lines)

### Component Type
- **React Type:** Client Component (`'use client'` directive)
- **Translation Method:** `useTranslations` hook from `next-intl`

### Component Structure
The component is a self-contained login form with:
- Email/password form fields with validation
- OAuth integration via GoogleOAuthButton
- Form state management (loading, errors)
- Password visibility toggle
- Remember me checkbox
- Error display with AlertCircle icon

### Identified Hardcoded Strings (30 strings)

#### Form Section Header (2 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 206 | `"Sign in with your account"` | `auth.login.form.header` |
| 222 | `"Or continue with email"` | `auth.login.form.divider` |

#### Form Field Labels (4 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 231 | `"Email Address"` | `auth.login.form.emailLabel` |
| 255 | `"Password"` | `auth.login.form.passwordLabel` |
| 244 | `"admin@faqbnb.com"` (placeholder) | `auth.login.form.emailPlaceholder` |
| 269 | `"Enter your password"` (placeholder) | `auth.login.form.passwordPlaceholder` |

#### Remember Me & Submit (4 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 303-304 | `"Remember me for 30 days"` | `auth.login.form.rememberMe` |
| 322 | `"Sign In with Email"` | `auth.login.form.submitButton` |
| 317 | `"Signing In..."` | `auth.login.form.submitting` |

#### Validation Error Messages (4 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 51 | `"Email is required"` | `auth.login.validation.emailRequired` |
| 53 | `"Please enter a valid email address"` | `auth.login.validation.emailInvalid` |
| 57 | `"Password is required"` | `auth.login.validation.passwordRequired` |
| 58 | `"Password must be at least 6 characters"` | `auth.login.validation.passwordTooShort` |

#### Authentication Error Messages (4 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 138 | `"Invalid email or password. Please check your credentials and try again."` | `auth.login.errors.invalidCredentials` |
| 141 | `"Access denied. Admin privileges are required."` | `auth.login.errors.accessDenied` |
| 161 | `"Login failed: No user returned"` | `auth.login.errors.noUserReturned` |
| 196 | `"Authentication Failed"` | `auth.login.errors.authenticationFailed` |

#### Helper Text (1 string)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 330 | `"Access restricted to authorized administrators only"` | `auth.login.form.restrictedAccess` |

---

## Implementation Tasks

### Task 2A.3.1: Add next-intl Import and Hook Setup
**Effort:** 5 minutes

Add the `useTranslations` hook import and initialize translation instance:

```typescript
// Add import at top of file (after existing imports)
import { useTranslations } from 'next-intl';

// Inside LoginForm component, at the start of the function body
const t = useTranslations('auth.login');
```

### Task 2A.3.2: Update Validation Error Messages
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
      if (!emailRegex.test(value as string)) return t('validation.emailInvalid');
      return undefined;

    case 'password':
      if (!value) return t('validation.passwordRequired');
      if ((value as string).length < 6) return t('validation.passwordTooShort');
      return undefined;

    default:
      return undefined;
  }
};
```

### Task 2A.3.3: Update Authentication Error Messages
**Effort:** 10 minutes

Update the error handling in `handleSubmit` to use translated messages:

**Before:**
```typescript
if (errorMessage.includes('Invalid login credentials') ||
    errorMessage.includes('Email not confirmed') ||
    errorMessage.includes('Invalid email or password')) {
  setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
} else if (errorMessage.includes('admin privileges') ||
           errorMessage.includes('Access denied')) {
  setErrors({ general: 'Access denied. Admin privileges are required.' });
}
```

**After:**
```typescript
if (errorMessage.includes('Invalid login credentials') ||
    errorMessage.includes('Email not confirmed') ||
    errorMessage.includes('Invalid email or password')) {
  setErrors({ general: t('errors.invalidCredentials') });
} else if (errorMessage.includes('admin privileges') ||
           errorMessage.includes('Access denied')) {
  setErrors({ general: t('errors.accessDenied') });
}
```

Also update the "No user returned" error:

**Before:**
```typescript
setErrors({ general: 'Login failed: No user returned' });
```

**After:**
```typescript
setErrors({ general: t('errors.noUserReturned') });
```

### Task 2A.3.4: Update Error Alert Section
**Effort:** 5 minutes

Update the general error display heading:

**Before:**
```tsx
<h3 className="text-sm font-medium text-red-800">Authentication Failed</h3>
```

**After:**
```tsx
<h3 className="text-sm font-medium text-red-800">{t('errors.authenticationFailed')}</h3>
```

### Task 2A.3.5: Update OAuth Section Header
**Effort:** 5 minutes

**Before:**
```tsx
<p className="text-sm font-medium text-gray-700 mb-4">Sign in with your account</p>
```

**After:**
```tsx
<p className="text-sm font-medium text-gray-700 mb-4">{t('form.header')}</p>
```

### Task 2A.3.6: Update Divider Text
**Effort:** 5 minutes

**Before:**
```tsx
<span className="px-2 bg-white text-gray-500">Or continue with email</span>
```

**After:**
```tsx
<span className="px-2 bg-white text-gray-500">{t('form.divider')}</span>
```

### Task 2A.3.7: Update Form Field Labels and Placeholders
**Effort:** 10 minutes

**Email Field - Before:**
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

**Email Field - After:**
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

**Password Field - Before:**
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

**Password Field - After:**
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

### Task 2A.3.8: Update Remember Me Checkbox
**Effort:** 5 minutes

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

### Task 2A.3.9: Update Submit Button Text
**Effort:** 5 minutes

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

### Task 2A.3.10: Update Helper Text
**Effort:** 5 minutes

**Before:**
```tsx
<p className="text-sm text-gray-600">
  Access restricted to authorized administrators only
</p>
```

**After:**
```tsx
<p className="text-sm text-gray-600">
  {t('form.restrictedAccess')}
</p>
```

### Task 2A.3.11: Add Translation Keys to en.json
**Effort:** 15 minutes

Add the required keys to `/messages/en.json` under the `auth.login` namespace. These keys extend the namespace created in REQ-322:

```json
{
  "auth": {
    "login": {
      "form": {
        "header": "Sign in with your account",
        "divider": "Or continue with email",
        "emailLabel": "Email Address",
        "emailPlaceholder": "admin@faqbnb.com",
        "passwordLabel": "Password",
        "passwordPlaceholder": "Enter your password",
        "rememberMe": "Remember me for 30 days",
        "submitButton": "Sign In with Email",
        "submitting": "Signing In...",
        "restrictedAccess": "Access restricted to authorized administrators only"
      },
      "validation": {
        "emailRequired": "Email is required",
        "emailInvalid": "Please enter a valid email address",
        "passwordRequired": "Password is required",
        "passwordTooShort": "Password must be at least 6 characters"
      },
      "errors": {
        "authenticationFailed": "Authentication Failed",
        "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
        "accessDenied": "Access denied. Admin privileges are required.",
        "noUserReturned": "Login failed: No user returned"
      }
    }
  }
}
```

### Task 2A.3.12: Verify Component Rendering
**Effort:** 10 minutes

- Verify the component renders correctly after changes
- Confirm no TypeScript errors related to translation keys
- Test in development environment with default locale
- Test form validation triggers translated error messages
- Test authentication flow errors display translated messages

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Modification Type | Scope |
|-----------|-------------------|-------|
| `/src/components/LoginForm.tsx` | Edit | Add imports, replace hardcoded strings with t() calls |
| `/messages/en.json` | Edit | Add `auth.login.form`, `auth.login.validation`, `auth.login.errors` keys |

### Functions/Sections Authorized for Modification

| Function/Section | Location | Changes |
|------------------|----------|---------|
| `LoginForm` component | Lines 28-335 | Add `useTranslations` hook |
| `validateField` function | Lines 48-64 | Replace validation error strings with t() calls |
| `handleSubmit` function | Lines 108-173 | Replace authentication error strings with t() calls |
| General error JSX section | Lines 191-200 | Replace "Authentication Failed" heading |
| OAuth section JSX | Lines 203-214 | Replace header text |
| Divider JSX | Lines 217-224 | Replace divider text |
| Email field JSX | Lines 229-251 | Replace label and placeholder |
| Password field JSX | Lines 254-290 | Replace label and placeholder |
| Remember me JSX | Lines 293-306 | Replace checkbox label |
| Submit button JSX | Lines 309-325 | Replace button text and loading text |
| Helper text JSX | Lines 328-332 | Replace restricted access text |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/app/login/LoginPageContent.tsx` | Separate task (2A.2 - REQ-323) |
| `/src/components/GoogleOAuthButton.tsx` | Separate task (2A.5) |
| `/src/contexts/AuthContext.tsx` | Outside scope - authentication logic |
| `/src/app/login/page.tsx` | Outside scope |

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Translation hook pattern | `useTranslations('auth.login')` | Matches next-intl convention for client components |
| Namespace structure | `auth.login.form.*` for form elements, `auth.login.validation.*` for validation, `auth.login.errors.*` for auth errors | Clear separation of concerns, consistent with REQ-322/REQ-323 |
| Validation error translation | Translate at validation time | Errors are displayed immediately; translation context available |
| Password length message | Static string (not interpolated) | Current validation uses hardcoded "6 characters" - keep consistent |
| Console log messages | Keep as hardcoded English | Debug-only, not user-facing |

---

## Quality Checklist

### Pre-Implementation
- [ ] Verify Epic 1 foundation is complete (`next-intl` installed)
- [ ] Verify `/messages/en.json` exists with proper structure
- [ ] Verify `auth.login` namespace structure exists (REQ-322 complete)
- [ ] Verify REQ-323 (LoginPageContent) is complete or in progress

### Implementation
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize `t` translation hook with `'auth.login'` namespace
- [ ] Replace all hardcoded strings identified in this document
- [ ] Add all translation keys to `/messages/en.json`
- [ ] Maintain existing component functionality
- [ ] Preserve all error handling behavior

### Post-Implementation
- [ ] TypeScript compilation succeeds with no errors
- [ ] Component renders correctly in development
- [ ] All text displays correctly with translations
- [ ] Login form validation works as expected
- [ ] Validation error messages display in correct language
- [ ] Authentication error messages display correctly
- [ ] OAuth flow integration remains functional
- [ ] Password visibility toggle works correctly
- [ ] Remember me checkbox functions correctly
- [ ] Form submission works correctly (success and error cases)
- [ ] No console errors related to missing translation keys

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Import and hook setup | 5 min |
| Update validation error messages | 15 min |
| Update authentication error messages | 10 min |
| Update error alert section | 5 min |
| Update OAuth section header | 5 min |
| Update divider text | 5 min |
| Update form field labels and placeholders | 10 min |
| Update remember me checkbox | 5 min |
| Update submit button text | 5 min |
| Update helper text | 5 min |
| Add translation keys to en.json | 15 min |
| Verification and testing | 15 min |
| **Total** | **~100 min** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 not complete | High | Critical | Block task until Epic 1 foundation verified |
| Missing translation keys at runtime | Low | Medium | Build-time key validation, fallback to key name |
| Validation timing issues | Low | Low | Translations are synchronous within component lifecycle |
| OAuth flow disruption | Low | Medium | GoogleOAuthButton is not modified in this task |
| Form state not reset on language change | Low | Low | Standard behavior - form retains values on re-render |

---

## Component Interaction Notes

1. **GoogleOAuthButton Integration:** The `GoogleOAuthButton` component receives callbacks (`onAuthStart`, `onAuthError`) but the button text itself is not modified in this task - it will be addressed in Task 2A.5.

2. **Error Display Pattern:** The component uses a two-part error display:
   - `errors.general` for authentication errors (translated in this task)
   - `errors.email` and `errors.password` for field-specific validation errors (translated in this task)

3. **Console Logs:** The component contains debug console.log statements (prefixed with emoji). These are intentionally kept as hardcoded English since they are development-only.

4. **onSuccess/onError Callbacks:** The `onError` callback receives the original error message (not translated), which may be appropriate if the parent component needs to handle the raw error. The displayed message is translated.

5. **searchParams Usage:** The component reads `redirect` from URL search params. This is navigation logic and doesn't require translation.

---

## Translation Key Relationship with REQ-322 and REQ-323

This task builds upon the `auth.login` namespace structure defined in REQ-322 and extends the patterns established in REQ-323:

| Document | Keys Added |
|----------|------------|
| REQ-322 | Base `auth.login` structure with general keys |
| REQ-323 | `auth.login.loading.*`, `auth.login.messages.*`, `auth.login.securityNotice.*` |
| **REQ-324 (this)** | `auth.login.form.*`, `auth.login.validation.*`, `auth.login.errors.*` |

The combined namespace after REQ-322, REQ-323, and REQ-324 provides comprehensive coverage of the login flow.

---

## References

- [REQ-324 Request Details](../gen_requests_epic2.md#req-324-internationalize-loginform-component)
- [REQ-323: LoginPageContent Overview](./REQ-323-update-srcapploginloginpagecontenttsx-overview.md)
- [REQ-322: Auth Namespace Structure](./REQ-322-create-auth-namespace-structure-overview.md)
- [Implementation Plan: L10N Epic 2](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Implementation Plan: L10N Epic 1](../prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Sub-Epic 2A: Authentication & Registration](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md#sub-epic-2a-authentication--registration)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A Task 2A.3*
