# REQ-329: Internationalize Registration Complete Page Component - Implementation Overview

**Created:** 2026-01-18 23:45:00 UTC
**Last Modified:** 2026-01-18 23:45:00 UTC
**Request Reference:** gen_requests_epic2.md - Request #329
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.8
**Priority:** High (Part of Sub-Epic 2A sequence)

---

## Executive Summary

This document provides the implementation breakdown for internationalizing the `CompleteRegistrationPage` component located at `/src/app/register/complete/page.tsx`. The component contains approximately **35 hardcoded English strings** that need to be extracted and replaced with translation function calls using the `next-intl` framework. This page handles the special OAuth completion flow where users have authenticated via Google but still need to provide an access code to finish registration.

---

## Dependencies

### Prerequisites (Must Be Completed First)

| Dependency | Status | Description |
|------------|--------|-------------|
| **Epic 1: L10N Foundation** | Required | `next-intl` package installation, i18n configuration, IntlProvider setup |
| **Task 2H.1: Common Namespace** | Required | Base `common` namespace in `/messages/en.json` for shared strings |
| **Task 2A.1: Auth Namespace** | Required | `auth` namespace structure in `/messages/en.json` |

**Critical Blocker:** The `next-intl` package must be installed and configured (Epic 1 foundation work) before this task can be implemented.

### Package Dependencies

```json
{
  "next-intl": "^3.x" // Required from Epic 1
}
```

---

## Current State Analysis

### Component Location
`/src/app/register/complete/page.tsx` (309 lines)

### Component Type
- **React Type:** Client Component (`'use client'` directive)
- **Translation Method:** `useTranslations` hook from `next-intl`

### Component Structure
The file contains two components:
1. `LoadingFallback` - Simple loading spinner component
2. `CompleteRegistrationPage` - Main page wrapper with Suspense
3. `CompleteRegistrationContent` - Main content component with form logic

### Identified Hardcoded Strings (35 strings)

#### LoadingFallback Component (1 string)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 20 | `"Loading..."` | `auth.completeRegistration.loading.page` or `common.loading` |

#### Auth Checking State (1 string)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 147 | `"Checking authentication..."` | `auth.completeRegistration.loading.checkingAuth` |

#### Success State Strings (3 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 160 | `"Registration Complete!"` | `auth.completeRegistration.success.heading` |
| 161 | `"Your account has been set up successfully."` | `auth.completeRegistration.success.message` |
| 162 | `"Redirecting to dashboard..."` | `auth.completeRegistration.success.redirecting` |

#### Header Section Strings (6 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 178 | `"FAQBNB Logo"` (alt text) | `common.logoAlt` |
| 183 | `"FAQBNB"` | `common.brand` |
| 184 | `"Complete Registration"` | `auth.completeRegistration.subtitle` |
| 188-189 | `"Almost there!"` | `auth.completeRegistration.heading` |
| 191-192 | `"Your Google sign-in was successful, but we need an access code to complete your registration."` | `auth.completeRegistration.description` |

#### Info Banner Strings (3 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 203 | `"Signed in as:"` | `auth.completeRegistration.signedInAs` |
| 206-207 | `"Enter your access code to complete account setup."` | `auth.completeRegistration.instruction` |

#### Form Strings (5 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 228-229 | `"Access Code"` | `auth.completeRegistration.form.accessCodeLabel` |
| 238 | `"Enter your access code"` (placeholder) | `auth.completeRegistration.form.accessCodePlaceholder` |
| 244-245 | `"Check your email for the access code from your invitation."` | `auth.completeRegistration.form.accessCodeHelp` |

#### Button Strings (3 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 258 | `"Completing Registration..."` | `auth.completeRegistration.form.submitting` |
| 261 | `"Complete Registration"` | `auth.completeRegistration.form.submitButton` |

#### Sign Out Section Strings (2 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 269-270 | `"Wrong account? Sign out and try again."` | `auth.completeRegistration.signOut.prompt` |
| 277 | `"Sign Out"` | `auth.completeRegistration.signOut.button` or `common.signOut` |

#### Footer Links Strings (3 strings)
| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 289 | `"Back to Home"` | `auth.completeRegistration.footer.backToHome` or `common.backToHome` |
| 295 | `"Request Access Code"` | `auth.completeRegistration.footer.requestAccess` |
| 302 | `"2024 FAQBNB. All rights reserved."` | `common.copyright` |

#### Error Messages (Dynamic - from API)
Error messages displayed in the error banner come from the API response (`result.error`) and are handled server-side. The frontend displays them as-is, so they should be translated at the API level (separate task).

---

## Implementation Tasks

### Task 2A.8.1: Add next-intl Import and Hook Setup
**Effort:** 5 minutes

Add the `useTranslations` hook import and initialize translation instances:

```typescript
// Add import at top of file
import { useTranslations } from 'next-intl';

// Inside LoadingFallback component
function LoadingFallback() {
  const t = useTranslations('auth.completeRegistration');
  // ... use t('loading.page') for "Loading..."
}

// Inside CompleteRegistrationContent component
function CompleteRegistrationContent() {
  const t = useTranslations('auth.completeRegistration');
  const tCommon = useTranslations('common');
  // ... existing code
}
```

### Task 2A.8.2: Update LoadingFallback Component
**Effort:** 5 minutes

Replace hardcoded loading text:

**Before:**
```tsx
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
```

**After:**
```tsx
function LoadingFallback() {
  const t = useTranslations('auth.completeRegistration');
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

### Task 2A.8.3: Update Auth Checking State
**Effort:** 5 minutes

Replace the authentication checking loading state:

**Before:**
```tsx
if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
}
```

**After:**
```tsx
if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('loading.checkingAuth')}</p>
      </div>
    </div>
  );
}
```

### Task 2A.8.4: Update Success State Section
**Effort:** 10 minutes

Replace success state strings:

**Before:**
```tsx
if (success) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
          <p className="text-gray-600 mb-4">Your account has been set up successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    </div>
  );
}
```

**After:**
```tsx
if (success) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('success.heading')}</h2>
          <p className="text-gray-600 mb-4">{t('success.message')}</p>
          <p className="text-sm text-gray-500">{t('success.redirecting')}</p>
        </div>
      </div>
    </div>
  );
}
```

### Task 2A.8.5: Update Header Section
**Effort:** 10 minutes

Replace header/branding strings:

**Before:**
```tsx
<Image
  src="/faqbnb_logoshort.png"
  alt="FAQBNB Logo"
  width={48}
  height={48}
  className="rounded-lg"
/>
<div className="text-left">
  <h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
  <p className="text-sm text-gray-600">Complete Registration</p>
</div>
// ...
<h2 className="text-3xl font-bold text-gray-900">
  Almost there!
</h2>
<p className="mt-2 text-sm text-gray-600">
  Your Google sign-in was successful, but we need an access code to complete your registration.
</p>
```

**After:**
```tsx
<Image
  src="/faqbnb_logoshort.png"
  alt={tCommon('logoAlt')}
  width={48}
  height={48}
  className="rounded-lg"
/>
<div className="text-left">
  <h1 className="text-2xl font-bold text-gray-900">{tCommon('brand')}</h1>
  <p className="text-sm text-gray-600">{t('subtitle')}</p>
</div>
// ...
<h2 className="text-3xl font-bold text-gray-900">
  {t('heading')}
</h2>
<p className="mt-2 text-sm text-gray-600">
  {t('description')}
</p>
```

### Task 2A.8.6: Update Info Banner Section
**Effort:** 5 minutes

Replace info banner strings:

**Before:**
```tsx
<p className="text-sm text-blue-800">
  <strong>Signed in as:</strong> {emailFromUrl}
</p>
<p className="text-xs text-blue-600 mt-1">
  Enter your access code to complete account setup.
</p>
```

**After:**
```tsx
<p className="text-sm text-blue-800">
  <strong>{t('signedInAs')}</strong> {emailFromUrl}
</p>
<p className="text-xs text-blue-600 mt-1">
  {t('instruction')}
</p>
```

### Task 2A.8.7: Update Form Section
**Effort:** 10 minutes

Replace form labels, placeholders, and button text:

**Before:**
```tsx
<label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
  Access Code
</label>
// ...
<input
  // ...
  placeholder="Enter your access code"
  // ...
/>
// ...
<p className="mt-2 text-xs text-gray-500">
  Check your email for the access code from your invitation.
</p>
// ...
<button type="submit" /* ... */>
  {isSubmitting ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Completing Registration...
    </>
  ) : (
    'Complete Registration'
  )}
</button>
```

**After:**
```tsx
<label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
  {t('form.accessCodeLabel')}
</label>
// ...
<input
  // ...
  placeholder={t('form.accessCodePlaceholder')}
  // ...
/>
// ...
<p className="mt-2 text-xs text-gray-500">
  {t('form.accessCodeHelp')}
</p>
// ...
<button type="submit" /* ... */>
  {isSubmitting ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      {t('form.submitting')}
    </>
  ) : (
    t('form.submitButton')
  )}
</button>
```

### Task 2A.8.8: Update Sign Out Section
**Effort:** 5 minutes

Replace sign out prompt and button text:

**Before:**
```tsx
<p className="text-xs text-gray-500 text-center mb-3">
  Wrong account? Sign out and try again.
</p>
<button onClick={handleSignOut} /* ... */>
  <LogOut className="h-4 w-4 mr-2" />
  Sign Out
</button>
```

**After:**
```tsx
<p className="text-xs text-gray-500 text-center mb-3">
  {t('signOut.prompt')}
</p>
<button onClick={handleSignOut} /* ... */>
  <LogOut className="h-4 w-4 mr-2" />
  {t('signOut.button')}
</button>
```

### Task 2A.8.9: Update Footer Links Section
**Effort:** 5 minutes

Replace footer link text and copyright:

**Before:**
```tsx
<Link href="/" /* ... */>
  <Home className="w-4 h-4 mr-1" />
  Back to Home
</Link>
<Link href="/request-access" /* ... */>
  Request Access Code
</Link>
// ...
<p className="text-xs text-gray-500">
  2024 FAQBNB. All rights reserved.
</p>
```

**After:**
```tsx
<Link href="/" /* ... */>
  <Home className="w-4 h-4 mr-1" />
  {t('footer.backToHome')}
</Link>
<Link href="/request-access" /* ... */>
  {t('footer.requestAccess')}
</Link>
// ...
<p className="text-xs text-gray-500">
  {tCommon('copyright')}
</p>
```

### Task 2A.8.10: Add Translation Keys to en.json
**Effort:** 15 minutes

Add the required keys to `/messages/en.json` under the `auth.completeRegistration` namespace:

```json
{
  "auth": {
    "completeRegistration": {
      "subtitle": "Complete Registration",
      "heading": "Almost there!",
      "description": "Your Google sign-in was successful, but we need an access code to complete your registration.",
      "signedInAs": "Signed in as:",
      "instruction": "Enter your access code to complete account setup.",
      "loading": {
        "page": "Loading...",
        "checkingAuth": "Checking authentication..."
      },
      "form": {
        "accessCodeLabel": "Access Code",
        "accessCodePlaceholder": "Enter your access code",
        "accessCodeHelp": "Check your email for the access code from your invitation.",
        "submitButton": "Complete Registration",
        "submitting": "Completing Registration..."
      },
      "success": {
        "heading": "Registration Complete!",
        "message": "Your account has been set up successfully.",
        "redirecting": "Redirecting to dashboard..."
      },
      "signOut": {
        "prompt": "Wrong account? Sign out and try again.",
        "button": "Sign Out"
      },
      "footer": {
        "backToHome": "Back to Home",
        "requestAccess": "Request Access Code"
      }
    }
  },
  "common": {
    "brand": "FAQBNB",
    "logoAlt": "FAQBNB Logo",
    "copyright": "2024 FAQBNB. All rights reserved."
  }
}
```

### Task 2A.8.11: Verify Component Rendering
**Effort:** 10 minutes

- Verify the component renders correctly after changes
- Confirm no TypeScript errors related to translation keys
- Test in development environment with default locale
- Test OAuth completion flow end-to-end

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Modification Type | Scope |
|-----------|-------------------|-------|
| `/src/app/register/complete/page.tsx` | Edit | Add imports, replace hardcoded strings with t() calls |
| `/messages/en.json` | Edit | Add `auth.completeRegistration` namespace keys |

### Functions/Sections Authorized for Modification

| Function/Section | Location | Changes |
|------------------|----------|---------|
| `LoadingFallback` component | Lines 15-24 | Add `useTranslations` hook, replace "Loading..." |
| `CompleteRegistrationContent` component | Lines 35-308 | Add `useTranslations` hooks, replace all hardcoded strings |
| Auth checking state JSX | Lines 142-151 | Replace "Checking authentication..." |
| Success state JSX | Lines 154-167 | Replace success heading, message, and redirect notice |
| Header JSX section | Lines 172-194 | Replace brand, subtitle, heading, description |
| Info banner section | Lines 199-210 | Replace "Signed in as:" and instruction |
| Form section | Lines 226-265 | Replace label, placeholder, helper text, button labels |
| Sign out section | Lines 268-279 | Replace prompt and button text |
| Footer links section | Lines 283-305 | Replace link texts and copyright |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/app/register/page.tsx` | Separate task (2A.6) |
| `/src/app/register/success/page.tsx` | Separate task (2A.7) |
| `/src/components/RegistrationForm.tsx` | Separate task (2A.4) |
| `/src/contexts/AuthContext.tsx` | Outside scope - authentication logic |
| `/src/app/api/auth/complete-oauth-registration/route.ts` | API error messages handled separately |

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Translation hook pattern | `useTranslations('auth.completeRegistration')` | Matches next-intl convention for client components |
| Namespace organization | `auth.completeRegistration.*` for page-specific, `common.*` for shared | Follows implementation plan structure |
| LoadingFallback translation | Use `useTranslations` inside component | Simple component, avoid prop drilling |
| API error messages | Keep as-is (dynamic from API) | Error translation handled at API level |
| Copyright year | Keep hardcoded for now | Can be made dynamic later with interpolation |
| Debug logs | Keep hardcoded English | Development-only, not user-facing |

---

## Quality Checklist

### Pre-Implementation
- [ ] Verify Epic 1 foundation is complete (`next-intl` installed)
- [ ] Verify `/messages/en.json` exists with proper structure
- [ ] Verify `auth` namespace structure exists (Task 2A.1 complete)

### Implementation
- [ ] Import `useTranslations` from `next-intl`
- [ ] Initialize `t` and `tCommon` translation hooks in both components
- [ ] Replace all hardcoded strings identified above
- [ ] Add all translation keys to `/messages/en.json`
- [ ] Maintain existing component functionality

### Post-Implementation
- [ ] TypeScript compilation succeeds with no errors
- [ ] Component renders correctly in development
- [ ] All text displays correctly with translations
- [ ] Loading states display proper messages
- [ ] Success state displays correctly
- [ ] OAuth completion flow works as expected
- [ ] Form submission and validation work correctly
- [ ] Sign out functionality works
- [ ] Footer links navigate correctly
- [ ] No console errors related to missing translation keys

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Import and hook setup | 5 min |
| Update LoadingFallback | 5 min |
| Update auth checking state | 5 min |
| Update success state section | 10 min |
| Update header section | 10 min |
| Update info banner section | 5 min |
| Update form section | 10 min |
| Update sign out section | 5 min |
| Update footer links section | 5 min |
| Add translation keys to en.json | 15 min |
| Verification and testing | 15 min |
| **Total** | **~90 min** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Epic 1 not complete | High | Critical | Block task until Epic 1 foundation verified |
| Missing translation keys at runtime | Low | Medium | Build-time key validation, fallback to key name |
| LoadingFallback hook issues | Low | Low | Simple component with isolated translation |
| OAuth flow interruption | Low | Medium | Test OAuth completion flow thoroughly |
| API error messages not translated | Medium | Low | Handled in separate API translation task |

---

## Notes

1. **Debug logs** (e.g., `DEBUG_PREFIX` and `console.log` statements) are intentionally kept as hardcoded English since they are development-only and not user-facing.

2. **API error messages** - The error message displayed in the error banner comes from `result.error` which is returned by the API. Translation of these messages should be handled at the API level (separate task for error message internationalization).

3. **Email from URL** - The `emailFromUrl` variable displays the user's email address dynamically and does not need translation.

4. **Copyright year** - Consider making the year dynamic (`{new Date().getFullYear()}`) during implementation, with the translated copyright pattern supporting interpolation: `"{year} FAQBNB. All rights reserved."`

5. **Two-component structure** - Both `LoadingFallback` and `CompleteRegistrationContent` need translation hooks added. The `CompleteRegistrationPage` wrapper component only renders other components and has no translatable strings.

6. **Suspense boundary** - The `Suspense` component wrapping the page content is required for `useSearchParams()` in client components. The translation hooks should work correctly within the Suspense boundary.

---

## References

- [REQ-329 Request Details](../gen_requests_epic2.md#req-329-internationalize-registration-complete-page-component)
- [Implementation Plan: L10N Epic 2](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Implementation Plan: L10N Epic 1](../prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Sub-Epic 2A: Authentication & Registration](../prd/Plan-111-L10N-Epic2-Static-UI-Translation.md#sub-epic-2a-authentication--registration)
