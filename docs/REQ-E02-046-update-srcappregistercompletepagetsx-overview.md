# Implementation Breakdown: REQ-E02-046 - Update Register Complete Page for Internationalization

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-046
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.8
**Priority:** P1 - High
**Size:** S (Small)

---

## Overview

This document provides a detailed implementation breakdown for updating the registration completion page (`/src/app/register/complete/page.tsx`) to support internationalization (i18n) using the next-intl library. This page handles "orphaned" auth users who completed OAuth sign-in but need to provide an access code to finalize their registration. All hardcoded English strings must be replaced with translation keys from the `auth` namespace to enable multi-language registration completion across all 6 supported languages (English, French, Spanish, German, Dutch, Italian).

---

## Request Summary

### Current Behavior
The register complete page component contains approximately 30+ hardcoded English strings including:
- Header/branding text ("Complete Registration", "Almost there!")
- Explanatory messages ("Your Google sign-in was successful, but we need an access code...")
- Status indicators ("Signed in as:", "Enter your access code to complete account setup")
- Form labels and placeholders ("Access Code", "Enter your access code")
- Helper text ("Check your email for the access code from your invitation")
- Button labels ("Complete Registration", "Completing Registration...", "Sign Out")
- Footer text ("Wrong account? Sign out and try again.", "Back to Home", "Request Access Code")
- Success state messages ("Registration Complete!", "Your account has been set up successfully", "Redirecting to dashboard...")
- Loading state text ("Loading...", "Checking authentication...")
- Error display for API errors

International users completing their OAuth registration see only English content regardless of their language preference.

### Expected Behavior
All user-facing text on the registration completion page is retrieved from the translation system using the `auth` namespace. Users see all setup instructions, form labels, status messages, and feedback in their selected language. Dynamic content such as the user's email displays correctly within translated structures using proper interpolation.

---

## Technical Context

### Component Architecture

The complete registration page consists of two components:

**`/src/app/register/complete/page.tsx`**
- Main page component: `CompleteRegistrationPage` (wrapper with Suspense)
- Content component: `CompleteRegistrationContent` (main logic)
- Client component with `'use client'` directive
- Uses React hooks (`useState`, `useEffect`) for state management
- Integrates with `AuthContext` for authentication state
- Uses `useSearchParams` for URL parameter extraction
- Conditional rendering based on: auth loading, success state, error state
- ~310 lines of code, ~30+ hardcoded strings

### Existing Patterns

The codebase has established patterns for internationalization:

1. **Translation Hook Usage** (from `GoogleOAuthButton.tsx`, `RegistrationForm.tsx`, similar auth components):
   ```typescript
   import { useTranslations } from 'next-intl';

   const t = useTranslations('auth');
   const tCommon = useTranslations('common');
   ```

2. **Translation File Structure** (`/messages/en.json`):
   - `auth` namespace exists with authentication strings
   - `common` namespace exists for shared UI strings
   - Nested keys for organized structure (e.g., `auth.register.complete.*`)

3. **Component Pattern**:
   - Client components use `'use client'` directive
   - Translation hooks called at component level
   - Multiple namespace hooks used simultaneously

### Dependencies
- **Epic 1 Foundation**: next-intl setup is complete
- **Translation Files**: `/messages/en.json` with `auth` namespace established
- **REQ-E02-039**: `auth` namespace structure (provides foundation)
- **REQ-E02-044**: Register page internationalization (related registration page)
- **REQ-E02-045**: Register success page internationalization (related registration flow)

---

## String Inventory

### `/src/app/register/complete/page.tsx` Strings

#### Loading Fallback Component (Lines 15-24)

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Loading..." | Line 20 | `common.loading` | Static |

#### Auth Loading State (Lines 142-151)

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Checking authentication..." | Line 147 | `auth.register.complete.checkingAuth` | Static |

#### Success State (Lines 154-167)

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Registration Complete!" | Line 160 | `auth.register.complete.successTitle` | Static |
| "Your account has been set up successfully." | Line 161 | `auth.register.complete.successMessage` | Static |
| "Redirecting to dashboard..." | Line 162 | `auth.register.complete.redirectingToDashboard` | Static |

#### Header/Branding Section (Lines 172-194)

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "FAQBNB Logo" (alt text) | Line 178 | `common.logoAlt` | Static |
| "FAQBNB" | Line 183 | `common.brandName` or keep as-is | Static |
| "Complete Registration" | Line 184 | `auth.register.complete.subtitle` | Static |
| "Almost there!" | Lines 188-189 | `auth.register.complete.title` | Static |
| "Your Google sign-in was successful, but we need an access code to complete your registration." | Lines 191-192 | `auth.register.complete.description` | Static |

#### Info Banner Section (Lines 199-210)

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Signed in as:" | Line 204 | `auth.register.complete.signedInAs` | Static |
| "Enter your access code to complete account setup." | Lines 206-207 | `auth.register.complete.enterAccessCodeHint` | Static |

#### Form Section (Lines 226-265)

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Access Code" | Lines 228-229 | `auth.register.complete.form.accessCodeLabel` | Static |
| "Enter your access code" | Line 238 | `auth.register.complete.form.accessCodePlaceholder` | Static |
| "Check your email for the access code from your invitation." | Lines 244-245 | `auth.register.complete.form.accessCodeHint` | Static |
| "Completing Registration..." | Line 258 | `auth.register.complete.form.submitting` | Static |
| "Complete Registration" | Line 261 | `auth.register.complete.form.submitButton` | Static |

#### Sign Out Section (Lines 268-279)

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Wrong account? Sign out and try again." | Lines 269-270 | `auth.register.complete.wrongAccount` | Static |
| "Sign Out" | Line 277 | `auth.signOut` | Static |

#### Footer Links (Lines 283-305)

| String | Location (Line) | Translation Key | Type |
|--------|-----------------|-----------------|------|
| "Back to Home" | Lines 288-290 | `common.backToHome` | Static |
| "Request Access Code" | Lines 293-295 | `auth.register.complete.requestAccessCode` | Static |
| "2024 FAQBNB. All rights reserved." | Lines 301-302 | `common.copyright` | Static |

---

## Implementation Tasks

### Task 1: Import Translation Hook

**Effort:** XS
**Description:** Add the `useTranslations` import and initialize hooks in both components.

**Changes:**
```typescript
// Add to existing imports (after line 11)
import { useTranslations } from 'next-intl';

// Add inside LoadingFallback component (after line 15)
// Note: LoadingFallback cannot use hooks as it's a simple function component
// We'll need to convert it or use a static fallback

// Add inside CompleteRegistrationContent component (after line 35)
const t = useTranslations('auth.register.complete');
const tAuth = useTranslations('auth');
const tCommon = useTranslations('common');
```

---

### Task 2: Update LoadingFallback Component

**Effort:** XS
**Description:** The LoadingFallback is rendered before Suspense resolves, so it cannot use hooks. Keep the static "Loading..." text or convert to a hook-compatible pattern.

**Option A: Keep static text for fallback (Recommended)**
```typescript
// Fallback components typically use static text
// Keep "Loading..." as-is since it's a brief loading state
```

**Option B: Pass translation as prop if needed**
```typescript
// If translation is needed, restructure to pass it from parent
// Not recommended due to complexity vs benefit
```

---

### Task 3: Replace Auth Loading State Strings

**Effort:** XS
**Description:** Replace the "Checking authentication..." text in the auth loading state.

**Location: Lines 142-151**
```typescript
// Before
<p className="text-gray-600">Checking authentication...</p>

// After
<p className="text-gray-600">{t('checkingAuth')}</p>
```

---

### Task 4: Replace Success State Strings

**Effort:** S
**Description:** Replace all strings in the success state section.

**Location: Lines 154-167**
```typescript
// Before
<h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
<p className="text-gray-600 mb-4">Your account has been set up successfully.</p>
<p className="text-sm text-gray-500">Redirecting to dashboard...</p>

// After
<h2 className="text-2xl font-bold text-gray-900 mb-2">{t('successTitle')}</h2>
<p className="text-gray-600 mb-4">{t('successMessage')}</p>
<p className="text-sm text-gray-500">{t('redirectingToDashboard')}</p>
```

---

### Task 5: Replace Header/Branding Strings

**Effort:** S
**Description:** Replace the header and branding text.

**Location: Lines 172-194**
```typescript
// Before
<Image
  src="/faqbnb_logoshort.png"
  alt="FAQBNB Logo"
  ...
/>
<h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
<p className="text-sm text-gray-600">Complete Registration</p>

<h2 className="text-3xl font-bold text-gray-900">
  Almost there!
</h2>
<p className="mt-2 text-sm text-gray-600">
  Your Google sign-in was successful, but we need an access code to complete your registration.
</p>

// After
<Image
  src="/faqbnb_logoshort.png"
  alt={tCommon('logoAlt') || 'FAQBNB Logo'}
  ...
/>
<h1 className="text-2xl font-bold text-gray-900">FAQBNB</h1>
<p className="text-sm text-gray-600">{t('subtitle')}</p>

<h2 className="text-3xl font-bold text-gray-900">
  {t('title')}
</h2>
<p className="mt-2 text-sm text-gray-600">
  {t('description')}
</p>
```

---

### Task 6: Replace Info Banner Strings

**Effort:** S
**Description:** Replace the info banner text with interpolation for email.

**Location: Lines 199-210**
```typescript
// Before
<p className="text-sm text-blue-800">
  <strong>Signed in as:</strong> {emailFromUrl}
</p>
<p className="text-xs text-blue-600 mt-1">
  Enter your access code to complete account setup.
</p>

// After
<p className="text-sm text-blue-800">
  <strong>{t('signedInAs')}</strong> {emailFromUrl}
</p>
<p className="text-xs text-blue-600 mt-1">
  {t('enterAccessCodeHint')}
</p>
```

---

### Task 7: Replace Form Section Strings

**Effort:** S
**Description:** Replace all form labels, placeholders, hints, and button text.

**Location: Lines 226-265**
```typescript
// Before
<label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
  Access Code
</label>
<input
  ...
  placeholder="Enter your access code"
  ...
/>
<p className="mt-2 text-xs text-gray-500">
  Check your email for the access code from your invitation.
</p>

<button type="submit" ...>
  {isSubmitting ? (
    <>
      <div className="animate-spin ..."></div>
      Completing Registration...
    </>
  ) : (
    'Complete Registration'
  )}
</button>

// After
<label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
  {t('form.accessCodeLabel')}
</label>
<input
  ...
  placeholder={t('form.accessCodePlaceholder')}
  ...
/>
<p className="mt-2 text-xs text-gray-500">
  {t('form.accessCodeHint')}
</p>

<button type="submit" ...>
  {isSubmitting ? (
    <>
      <div className="animate-spin ..."></div>
      {t('form.submitting')}
    </>
  ) : (
    t('form.submitButton')
  )}
</button>
```

---

### Task 8: Replace Sign Out Section Strings

**Effort:** XS
**Description:** Replace the sign out section text.

**Location: Lines 268-279**
```typescript
// Before
<p className="text-xs text-gray-500 text-center mb-3">
  Wrong account? Sign out and try again.
</p>
<button ...>
  <LogOut className="h-4 w-4 mr-2" />
  Sign Out
</button>

// After
<p className="text-xs text-gray-500 text-center mb-3">
  {t('wrongAccount')}
</p>
<button ...>
  <LogOut className="h-4 w-4 mr-2" />
  {tAuth('signOut')}
</button>
```

---

### Task 9: Replace Footer Links Strings

**Effort:** S
**Description:** Replace all footer link text and copyright.

**Location: Lines 283-305**
```typescript
// Before
<Link href="/" ...>
  <Home className="w-4 h-4 mr-1" />
  Back to Home
</Link>
<Link href="/request-access" ...>
  Request Access Code
</Link>
<p className="text-xs text-gray-500">
  2024 FAQBNB. All rights reserved.
</p>

// After
<Link href="/" ...>
  <Home className="w-4 h-4 mr-1" />
  {tCommon('backToHome') || 'Back to Home'}
</Link>
<Link href="/request-access" ...>
  {t('requestAccessCode')}
</Link>
<p className="text-xs text-gray-500">
  {tCommon('copyright') || '2024 FAQBNB. All rights reserved.'}
</p>
```

---

### Task 10: Update Translation Files

**Effort:** M
**Description:** Add all new translation keys to `/messages/en.json` under the `auth.register.complete` namespace.

**New Keys Structure:**
```json
{
  "auth": {
    "register": {
      "complete": {
        "title": "Almost there!",
        "subtitle": "Complete Registration",
        "description": "Your Google sign-in was successful, but we need an access code to complete your registration.",
        "checkingAuth": "Checking authentication...",
        "signedInAs": "Signed in as:",
        "enterAccessCodeHint": "Enter your access code to complete account setup.",
        "wrongAccount": "Wrong account? Sign out and try again.",
        "requestAccessCode": "Request Access Code",
        "successTitle": "Registration Complete!",
        "successMessage": "Your account has been set up successfully.",
        "redirectingToDashboard": "Redirecting to dashboard...",
        "form": {
          "accessCodeLabel": "Access Code",
          "accessCodePlaceholder": "Enter your access code",
          "accessCodeHint": "Check your email for the access code from your invitation.",
          "submitButton": "Complete Registration",
          "submitting": "Completing Registration..."
        }
      }
    }
  },
  "common": {
    "backToHome": "Back to Home",
    "logoAlt": "FAQBNB Logo",
    "copyright": "2024 FAQBNB. All rights reserved."
  }
}
```

**Note:** Some `common` keys may already exist. Verify existence before adding.

---

### Task 11: Verification Testing

**Effort:** S
**Description:** Verify the component renders correctly in all supported languages.

**Test Cases:**
1. Load the complete registration page with valid auth session
2. Verify page redirects to login if no auth session
3. Verify header/branding displays correctly in all 6 languages
4. Verify info banner displays with correct email interpolation
5. Verify form labels and placeholders display correctly
6. Verify helper text displays correctly
7. Verify submit button shows correct text (normal and submitting states)
8. Verify sign out section displays correctly
9. Verify footer links display correctly
10. Verify success state displays correctly after successful submission
11. Verify auth loading state displays correctly
12. Verify error messages display when API returns errors
13. Verify page layout remains intact with longer translated text (especially German/Dutch)
14. Test that sign out button still works after changes
15. Test that form submission still works correctly

---

## Authorized Files and Functions for Modification

### Primary Component File
| File | Purpose | Modifications Allowed |
|------|---------|----------------------|
| `/src/app/register/complete/page.tsx` | Complete registration page component | Add imports, modify all ~30+ hardcoded strings to use translation hooks |

### Translation Files
| File | Purpose | Modifications Allowed |
|------|---------|----------------------|
| `/messages/en.json` | English translations | Add new keys under `auth.register.complete` namespace |
| `/messages/fr.json` | French translations | Add translations (handled by separate task) |
| `/messages/es.json` | Spanish translations | Add translations (handled by separate task) |
| `/messages/de.json` | German translations | Add translations (handled by separate task) |
| `/messages/nl.json` | Dutch translations | Add translations (handled by separate task) |
| `/messages/it.json` | Italian translations | Add translations (handled by separate task) |

### Functions/Components to Modify

| Function/Component | File | Line Numbers | Modification |
|-------------------|------|--------------|--------------|
| `LoadingFallback` | page.tsx | 15-24 | Keep static or add translated text |
| `CompleteRegistrationContent` | page.tsx | 35-309 | Add translation hooks, replace all hardcoded strings |
| Auth loading render | page.tsx | 142-151 | Replace loading text |
| Success state render | page.tsx | 154-167 | Replace all success messages |
| Header section | page.tsx | 172-194 | Replace branding and title text |
| Info banner | page.tsx | 199-210 | Replace info text with interpolation |
| Form section | page.tsx | 226-265 | Replace labels, placeholders, hints, button text |
| Sign out section | page.tsx | 268-279 | Replace sign out text |
| Footer section | page.tsx | 283-305 | Replace link text and copyright |

---

## Implementation Checklist

- [ ] Import `useTranslations` hook from 'next-intl'
- [ ] Initialize `t`, `tAuth`, `tCommon` hooks at component level
- [ ] Decide on LoadingFallback translation approach (recommend: keep static)
- [ ] Replace "Checking authentication..." text
- [ ] Replace "Registration Complete!" success title
- [ ] Replace "Your account has been set up successfully." success message
- [ ] Replace "Redirecting to dashboard..." text
- [ ] Replace "Complete Registration" subtitle
- [ ] Replace "Almost there!" title
- [ ] Replace Google sign-in description
- [ ] Replace "Signed in as:" label
- [ ] Replace "Enter your access code to complete account setup." hint
- [ ] Replace "Access Code" form label
- [ ] Replace "Enter your access code" placeholder
- [ ] Replace access code helper text
- [ ] Replace "Complete Registration" button text
- [ ] Replace "Completing Registration..." loading text
- [ ] Replace "Wrong account? Sign out and try again." text
- [ ] Replace "Sign Out" button text (use existing auth key)
- [ ] Replace "Back to Home" link text
- [ ] Replace "Request Access Code" link text
- [ ] Replace copyright footer text
- [ ] Add new keys to `/messages/en.json` under `auth.register.complete`
- [ ] Verify `common.backToHome` key exists, add if missing
- [ ] Verify page displays correctly in all 6 supported languages
- [ ] Test complete registration flow end-to-end
- [ ] Test success state rendering
- [ ] Test error state rendering
- [ ] Test sign out functionality still works

---

## Dependencies

### Blocking Dependencies
- REQ-E02-039: `auth` namespace structure must exist in translation files

### Non-Blocking Dependencies
- REQ-E02-044: Register page internationalization (related registration page)
- REQ-E02-045: Register success page internationalization (related success page)
- Translation generation tasks for non-English languages (handled separately)

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| LoadingFallback cannot use hooks | Low | Keep static English text for brief fallback state |
| Hook initialization order with Suspense | Low | Hooks are initialized in CompleteRegistrationContent, which is inside Suspense |
| Email interpolation in translated string | Low | Use simple concatenation with translated label |
| Conditional rendering may miss edge cases | Low | Test all 4 main states: loading, auth loading, success, form |
| Layout issues with longer German/Dutch text | Low | Test visual layout in all languages, use flexible CSS |
| Debug logs contain hardcoded strings | None | Debug logs (console.log) are not user-facing, leave as-is |
| Error state uses API-returned error messages | Low | API errors may be in English; consider adding client-side fallbacks |

---

## Acceptance Criteria

From REQ-E02-046:
- [ ] All hardcoded strings replaced with translation function calls from the auth namespace
- [ ] Page metadata (title, description) uses translated strings
- [ ] Welcome headline and introductory text use translation keys (e.g., auth.register.complete.welcome)
- [ ] Profile setup instructions and step descriptions use translation keys
- [ ] Progress indicators or completion status text uses translation keys with support for dynamic percentage values if applicable
- [ ] All form field labels, placeholders, and helper text use translation keys
- [ ] Call-to-action button labels use translation keys (e.g., "Complete Setup", "Skip for Now", "Continue to Dashboard")
- [ ] Any tooltips, hints, or informational messages use translation keys
- [ ] Translation keys follow the established auth.register.complete.* namespace structure

---

## Effort Estimate

| Task | Effort |
|------|--------|
| Import and initialize hooks | XS |
| Update LoadingFallback (if needed) | XS |
| Replace auth loading state strings | XS |
| Replace success state strings | S |
| Replace header/branding strings | S |
| Replace info banner strings | S |
| Replace form section strings | S |
| Replace sign out section strings | XS |
| Replace footer links strings | S |
| Update translation files | M |
| Testing | S |
| **Total** | **S (Small)** |

Estimated time: 1 - 1.5 hours for implementation, 30 minutes for testing.

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-046
- [Pattern Reference: Register Success Page Overview](/docs/REQ-E02-045-update-srcappregistersuccesspagetsx-overview.md)
- [Pattern Reference: Register Page Overview](/docs/REQ-E02-044-update-srcappregisterpagetsx-overview.md)
- [Translation File: en.json](/messages/en.json)
- [i18n Config: config.ts](/src/lib/i18n/config.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A: Authentication & Registration*
