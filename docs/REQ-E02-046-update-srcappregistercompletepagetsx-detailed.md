# Detailed Task Breakdown: REQ-E02-046 - Update Register Complete Page for Internationalization

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-046
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.8
**Priority:** P1 - High
**Size:** S (Small)
**Estimated Story Points:** 2

---

## Overview

This document provides granular, implementation-ready tasks for updating the registration completion page (`/src/app/register/complete/page.tsx`) to support internationalization using next-intl. This page handles "orphaned" auth users who completed OAuth sign-in but need to provide an access code to finalize their registration. All hardcoded English strings will be replaced with translation keys from the `auth.register.complete` namespace.

---

## Source Documents

- **Overview Document:** REQ-E02-046-update-srcappregistercompletepagetsx-overview.md
- **Requirements:** gen_requests_epic2.md (REQ-E02-046)
- **Implementation Plan:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## File Inventory

### Files to Modify

| File Path | Type | Current Strings | Action |
|-----------|------|-----------------|--------|
| `/src/app/register/complete/page.tsx` | Client Component | 22 hardcoded strings | Add i18n hooks, replace all strings |
| `/messages/en.json` | Translation File | Existing `auth` namespace | Add `auth.register.complete` keys |

### Files to Verify (No Modification)

| File Path | Verification Purpose |
|-----------|---------------------|
| `/messages/fr.json` | Verify structure for later translation |
| `/messages/es.json` | Verify structure for later translation |
| `/messages/de.json` | Verify structure for later translation |
| `/messages/nl.json` | Verify structure for later translation |
| `/messages/it.json` | Verify structure for later translation |

---

## Current State Analysis

### Component: `/src/app/register/complete/page.tsx`

**File Statistics:**
- Total Lines: 309
- Component Type: Client Component (`'use client'`)
- React Hooks Used: `useState`, `useEffect`, `useRouter`, `useSearchParams`, `useAuth`
- Hardcoded Strings: 22 user-facing strings
- Main Components: `LoadingFallback`, `CompleteRegistrationPage`, `CompleteRegistrationContent`

**Existing Imports (Lines 1-12):**
```typescript
'use client';

// Complete Registration Page
// Handles "orphaned" auth users who completed OAuth but didn't finish app registration
// Last Modified: 2026-01-16

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, CheckCircle, Home, Shield, LogOut } from 'lucide-react';
```

**Component States:**
1. `authLoading` - Boolean for auth loading state
2. `success` - Boolean for successful registration completion
3. `error` - String or null for error messages
4. `isSubmitting` - Boolean for form submission state
5. `accessCode` - String for access code input

**Render States:**
1. **Auth Loading State** (Lines 142-151) - Shows "Checking authentication..."
2. **Success State** (Lines 154-167) - Shows completion message and redirect notice
3. **Main Form State** (Lines 169-307) - Shows access code form

---

## String Extraction Inventory

### Category 1: LoadingFallback Component (1 string)

| # | Line | Current String | Translation Key | Notes |
|---|------|----------------|-----------------|-------|
| 1 | 20 | "Loading..." | Keep static or `common.loading` | Suspense fallback - hooks cannot be used |

**Decision:** Keep "Loading..." as static text since LoadingFallback is a Suspense fallback component and cannot use React hooks.

### Category 2: Auth Loading State (1 string)

| # | Line | Current String | Translation Key | Notes |
|---|------|----------------|-----------------|-------|
| 2 | 147 | "Checking authentication..." | `auth.register.complete.checkingAuth` | Loading state text |

### Category 3: Success State (3 strings)

| # | Line | Current String | Translation Key | Notes |
|---|------|----------------|-----------------|-------|
| 3 | 160 | "Registration Complete!" | `auth.register.complete.successTitle` | Main success headline |
| 4 | 161 | "Your account has been set up successfully." | `auth.register.complete.successMessage` | Success description |
| 5 | 162 | "Redirecting to dashboard..." | `auth.register.complete.redirectingToDashboard` | Redirect notice |

### Category 4: Header/Branding Section (4 strings)

| # | Line | Current String | Translation Key | Notes |
|---|------|----------------|-----------------|-------|
| 6 | 177 | "FAQBNB Logo" (alt) | `common.logoAlt` | Image alt text |
| 7 | 183 | "FAQBNB" | Keep hardcoded | Brand name, no translation |
| 8 | 184 | "Complete Registration" | `auth.register.complete.subtitle` | Subtitle under logo |
| 9 | 188-189 | "Almost there!" | `auth.register.complete.title` | Main page headline |
| 10 | 191-192 | "Your Google sign-in was successful, but we need an access code to complete your registration." | `auth.register.complete.description` | Page description |

### Category 5: Info Banner Section (2 strings)

| # | Line | Current String | Translation Key | Notes |
|---|------|----------------|-----------------|-------|
| 11 | 203-204 | "Signed in as:" | `auth.register.complete.signedInAs` | Email label |
| 12 | 206-207 | "Enter your access code to complete account setup." | `auth.register.complete.enterAccessCodeHint` | Info hint |

### Category 6: Form Section (5 strings)

| # | Line | Current String | Translation Key | Notes |
|---|------|----------------|-----------------|-------|
| 13 | 228-229 | "Access Code" | `auth.register.complete.form.accessCodeLabel` | Form label |
| 14 | 238 | "Enter your access code" | `auth.register.complete.form.accessCodePlaceholder` | Input placeholder |
| 15 | 244-245 | "Check your email for the access code from your invitation." | `auth.register.complete.form.accessCodeHint` | Helper text |
| 16 | 258 | "Completing Registration..." | `auth.register.complete.form.submitting` | Submit button loading |
| 17 | 261 | "Complete Registration" | `auth.register.complete.form.submitButton` | Submit button text |

### Category 7: Sign Out Section (2 strings)

| # | Line | Current String | Translation Key | Notes |
|---|------|----------------|-----------------|-------|
| 18 | 269-270 | "Wrong account? Sign out and try again." | `auth.register.complete.wrongAccount` | Hint text |
| 19 | 277 | "Sign Out" | `auth.signOut` | Use existing auth key |

### Category 8: Footer Links (3 strings)

| # | Line | Current String | Translation Key | Notes |
|---|------|----------------|-----------------|-------|
| 20 | 289-290 | "Back to Home" | `common.backToHome` | Home link |
| 21 | 294-295 | "Request Access Code" | `auth.register.complete.requestAccessCode` | Access request link |
| 22 | 301-302 | "2024 FAQBNB. All rights reserved." | `common.copyright` | Copyright footer |

---

## Implementation Tasks

### Task 1: Add Translation Keys to `/messages/en.json`

**Effort:** XS (10 minutes)
**Dependencies:** None
**Status:** Pending

**Description:** Add the `auth.register.complete` namespace to the English translation file.

**File:** `/messages/en.json`

**Changes:**

Add the following keys under the existing `auth.register` namespace:

```json
{
  "auth": {
    ...existing keys...
    "signOut": "Sign Out",
    "register": {
      ...existing keys...
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
  }
}
```

**Verification:**
- [ ] JSON syntax is valid
- [ ] Keys are nested correctly under `auth.register.complete`
- [ ] All 15 unique strings are included
- [ ] `auth.signOut` key exists (add if missing)

---

### Task 2: Add Common Namespace Keys (If Missing)

**Effort:** XS (3 minutes)
**Dependencies:** Task 1
**Status:** Pending

**Description:** Verify and add missing keys to the common namespace.

**File:** `/messages/en.json`

**Check Current State:**
Verify if these keys exist in `common` namespace:

**Keys to verify/add:**

```json
{
  "common": {
    ...existing keys...
    "backToHome": "Back to Home",
    "logoAlt": "FAQBNB Logo",
    "copyright": "2024 FAQBNB. All rights reserved.",
    "loading": "Loading..."
  }
}
```

**Verification:**
- [ ] `common.backToHome` key exists
- [ ] `common.logoAlt` key exists
- [ ] `common.copyright` key exists
- [ ] `common.loading` key exists (optional, for future use)

---

### Task 3: Import useTranslations Hook

**Effort:** XS (2 minutes)
**Dependencies:** Tasks 1, 2
**Status:** Pending

**Description:** Add the `useTranslations` import from next-intl to the component.

**File:** `/src/app/register/complete/page.tsx`

**Location:** Line 12 (after existing imports)

**Current Code (Line 12):**
```typescript
import { AlertCircle, CheckCircle, Home, Shield, LogOut } from 'lucide-react';
```

**New Code (Add after Line 12):**
```typescript
import { useTranslations } from 'next-intl';
```

**Verification:**
- [ ] Import statement added after line 12
- [ ] No TypeScript errors

---

### Task 4: Initialize Translation Hooks in CompleteRegistrationContent

**Effort:** XS (3 minutes)
**Dependencies:** Task 3
**Status:** Pending

**Description:** Initialize the translation hooks inside the `CompleteRegistrationContent` component.

**File:** `/src/app/register/complete/page.tsx`

**Location:** Inside `CompleteRegistrationContent` component, after line 38 (after state declarations)

**Current Code (Lines 35-44):**
```typescript
function CompleteRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, loading: authLoading, signOut } = useAuth();

  const [accessCode, setAccessCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
```

**New Code (Insert after line 43, before `const emailFromUrl`):**
```typescript
  const t = useTranslations('auth.register.complete');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
```

**Verification:**
- [ ] Hooks initialized inside component function
- [ ] Hooks declared before `emailFromUrl` constant
- [ ] No TypeScript errors
- [ ] Three translation hooks initialized: `t`, `tAuth`, `tCommon`

---

### Task 5: Replace Auth Loading State String

**Effort:** XS (2 minutes)
**Dependencies:** Task 4
**Status:** Pending

**Description:** Replace the "Checking authentication..." text in the auth loading state.

**File:** `/src/app/register/complete/page.tsx`

**Location:** Line 147

**Current Code:**
```tsx
<p className="text-gray-600">Checking authentication...</p>
```

**New Code:**
```tsx
<p className="text-gray-600">{t('checkingAuth')}</p>
```

**Verification:**
- [ ] String replaced with `{t('checkingAuth')}`
- [ ] CSS classes unchanged

---

### Task 6: Replace Success State Strings

**Effort:** XS (3 minutes)
**Dependencies:** Task 4
**Status:** Pending

**Description:** Replace all strings in the success state section.

**File:** `/src/app/register/complete/page.tsx`

**Location:** Lines 160-162

**Current Code:**
```tsx
<h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
<p className="text-gray-600 mb-4">Your account has been set up successfully.</p>
<p className="text-sm text-gray-500">Redirecting to dashboard...</p>
```

**New Code:**
```tsx
<h2 className="text-2xl font-bold text-gray-900 mb-2">{t('successTitle')}</h2>
<p className="text-gray-600 mb-4">{t('successMessage')}</p>
<p className="text-sm text-gray-500">{t('redirectingToDashboard')}</p>
```

**Verification:**
- [ ] `successTitle` replaced
- [ ] `successMessage` replaced
- [ ] `redirectingToDashboard` replaced
- [ ] CSS classes unchanged

---

### Task 7: Replace Header/Branding Strings

**Effort:** S (5 minutes)
**Dependencies:** Task 4
**Status:** Pending

**Description:** Replace the header and branding text (except brand name "FAQBNB").

**File:** `/src/app/register/complete/page.tsx`

**Location:** Lines 175-193

**Current Code (Line 177):**
```tsx
<Image
  src="/faqbnb_logoshort.png"
  alt="FAQBNB Logo"
  width={48}
  height={48}
  className="rounded-lg"
/>
```

**New Code:**
```tsx
<Image
  src="/faqbnb_logoshort.png"
  alt={tCommon('logoAlt')}
  width={48}
  height={48}
  className="rounded-lg"
/>
```

**Current Code (Line 184):**
```tsx
<p className="text-sm text-gray-600">Complete Registration</p>
```

**New Code:**
```tsx
<p className="text-sm text-gray-600">{t('subtitle')}</p>
```

**Current Code (Lines 188-193):**
```tsx
<h2 className="text-3xl font-bold text-gray-900">
  Almost there!
</h2>
<p className="mt-2 text-sm text-gray-600">
  Your Google sign-in was successful, but we need an access code to complete your registration.
</p>
```

**New Code:**
```tsx
<h2 className="text-3xl font-bold text-gray-900">
  {t('title')}
</h2>
<p className="mt-2 text-sm text-gray-600">
  {t('description')}
</p>
```

**Verification:**
- [ ] Logo alt text replaced with `{tCommon('logoAlt')}`
- [ ] Subtitle replaced with `{t('subtitle')}`
- [ ] Title replaced with `{t('title')}`
- [ ] Description replaced with `{t('description')}`
- [ ] "FAQBNB" brand name kept hardcoded (line 183)

---

### Task 8: Replace Info Banner Strings

**Effort:** XS (3 minutes)
**Dependencies:** Task 4
**Status:** Pending

**Description:** Replace the info banner text.

**File:** `/src/app/register/complete/page.tsx`

**Location:** Lines 203-208

**Current Code:**
```tsx
<p className="text-sm text-blue-800">
  <strong>Signed in as:</strong> {emailFromUrl}
</p>
<p className="text-xs text-blue-600 mt-1">
  Enter your access code to complete account setup.
</p>
```

**New Code:**
```tsx
<p className="text-sm text-blue-800">
  <strong>{t('signedInAs')}</strong> {emailFromUrl}
</p>
<p className="text-xs text-blue-600 mt-1">
  {t('enterAccessCodeHint')}
</p>
```

**Verification:**
- [ ] "Signed in as:" replaced with `{t('signedInAs')}`
- [ ] Hint text replaced with `{t('enterAccessCodeHint')}`
- [ ] Email display `{emailFromUrl}` unchanged

---

### Task 9: Replace Form Label and Placeholder Strings

**Effort:** XS (3 minutes)
**Dependencies:** Task 4
**Status:** Pending

**Description:** Replace the form label, placeholder, and helper text.

**File:** `/src/app/register/complete/page.tsx`

**Location:** Lines 227-246

**Current Code (Lines 228-229):**
```tsx
<label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
  Access Code
</label>
```

**New Code:**
```tsx
<label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
  {t('form.accessCodeLabel')}
</label>
```

**Current Code (Line 238):**
```tsx
placeholder="Enter your access code"
```

**New Code:**
```tsx
placeholder={t('form.accessCodePlaceholder')}
```

**Current Code (Lines 244-246):**
```tsx
<p className="mt-2 text-xs text-gray-500">
  Check your email for the access code from your invitation.
</p>
```

**New Code:**
```tsx
<p className="mt-2 text-xs text-gray-500">
  {t('form.accessCodeHint')}
</p>
```

**Verification:**
- [ ] Form label replaced with `{t('form.accessCodeLabel')}`
- [ ] Placeholder replaced with `{t('form.accessCodePlaceholder')}`
- [ ] Helper text replaced with `{t('form.accessCodeHint')}`

---

### Task 10: Replace Submit Button Strings

**Effort:** XS (3 minutes)
**Dependencies:** Task 4
**Status:** Pending

**Description:** Replace the submit button text for both normal and loading states.

**File:** `/src/app/register/complete/page.tsx`

**Location:** Lines 255-263

**Current Code:**
```tsx
{isSubmitting ? (
  <>
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
    Completing Registration...
  </>
) : (
  'Complete Registration'
)}
```

**New Code:**
```tsx
{isSubmitting ? (
  <>
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
    {t('form.submitting')}
  </>
) : (
  t('form.submitButton')
)}
```

**Verification:**
- [ ] Loading text replaced with `{t('form.submitting')}`
- [ ] Button text replaced with `{t('form.submitButton')}`
- [ ] Spinner element unchanged

---

### Task 11: Replace Sign Out Section Strings

**Effort:** XS (3 minutes)
**Dependencies:** Task 4
**Status:** Pending

**Description:** Replace the sign out section text.

**File:** `/src/app/register/complete/page.tsx`

**Location:** Lines 268-278

**Current Code (Lines 269-270):**
```tsx
<p className="text-xs text-gray-500 text-center mb-3">
  Wrong account? Sign out and try again.
</p>
```

**New Code:**
```tsx
<p className="text-xs text-gray-500 text-center mb-3">
  {t('wrongAccount')}
</p>
```

**Current Code (Lines 276-277):**
```tsx
<LogOut className="h-4 w-4 mr-2" />
Sign Out
```

**New Code:**
```tsx
<LogOut className="h-4 w-4 mr-2" />
{tAuth('signOut')}
```

**Verification:**
- [ ] Hint text replaced with `{t('wrongAccount')}`
- [ ] "Sign Out" replaced with `{tAuth('signOut')}`
- [ ] LogOut icon unchanged

---

### Task 12: Replace Footer Link Strings

**Effort:** XS (4 minutes)
**Dependencies:** Task 4
**Status:** Pending

**Description:** Replace all footer link text and copyright.

**File:** `/src/app/register/complete/page.tsx`

**Location:** Lines 283-304

**Current Code (Lines 288-291):**
```tsx
<Link
  href="/"
  className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  <Home className="w-4 h-4 mr-1" />
  Back to Home
</Link>
```

**New Code:**
```tsx
<Link
  href="/"
  className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  <Home className="w-4 h-4 mr-1" />
  {tCommon('backToHome')}
</Link>
```

**Current Code (Lines 292-297):**
```tsx
<Link
  href="/request-access"
  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  Request Access Code
</Link>
```

**New Code:**
```tsx
<Link
  href="/request-access"
  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
>
  {t('requestAccessCode')}
</Link>
```

**Current Code (Lines 300-303):**
```tsx
<div className="mt-4">
  <p className="text-xs text-gray-500">
    2024 FAQBNB. All rights reserved.
  </p>
</div>
```

**New Code:**
```tsx
<div className="mt-4">
  <p className="text-xs text-gray-500">
    {tCommon('copyright')}
  </p>
</div>
```

**Verification:**
- [ ] "Back to Home" replaced with `{tCommon('backToHome')}`
- [ ] "Request Access Code" replaced with `{t('requestAccessCode')}`
- [ ] Copyright replaced with `{tCommon('copyright')}`
- [ ] Link hrefs unchanged

---

### Task 13: Verify Build Compilation

**Effort:** XS (5 minutes)
**Dependencies:** Tasks 1-12
**Status:** Pending

**Description:** Run TypeScript compilation and build to verify no errors.

**Commands:**
```bash
npm run build
```

**Verification:**
- [ ] TypeScript compilation succeeds
- [ ] Next.js build completes without errors
- [ ] No missing translation key warnings

---

### Task 14: Manual Testing - Main Registration Flow

**Effort:** S (10 minutes)
**Dependencies:** Task 13
**Status:** Pending

**Description:** Test the complete registration page with an authenticated user.

**Test Steps:**
1. Start the development server
2. Sign in with Google OAuth (without completing full registration)
3. Navigate to `/register/complete` or be redirected there
4. Verify all strings display correctly:
   - [ ] "Complete Registration" subtitle
   - [ ] "Almost there!" title
   - [ ] Page description
   - [ ] "Signed in as:" with email
   - [ ] Info banner hint text
   - [ ] "Access Code" form label
   - [ ] Input placeholder
   - [ ] Helper text about invitation email
   - [ ] "Complete Registration" button
   - [ ] "Wrong account? Sign out and try again." text
   - [ ] "Sign Out" button
   - [ ] "Back to Home" link
   - [ ] "Request Access Code" link
   - [ ] Copyright footer
5. Test form submission:
   - [ ] Enter invalid access code, verify error displays
   - [ ] Verify "Completing Registration..." appears during submission
6. Test sign out button functionality

**Verification:**
- [ ] All strings render correctly
- [ ] No missing translation placeholders
- [ ] Form submission works
- [ ] Sign out functionality works

---

### Task 15: Manual Testing - Success State

**Effort:** S (8 minutes)
**Dependencies:** Task 13
**Status:** Pending

**Description:** Test the success state after successful registration completion.

**Test Steps:**
1. Complete the registration flow with a valid access code
2. Verify success state displays:
   - [ ] "Registration Complete!" title
   - [ ] "Your account has been set up successfully." message
   - [ ] "Redirecting to dashboard..." notice
3. Verify automatic redirect to dashboard works

**Verification:**
- [ ] Success state strings render correctly
- [ ] Auto-redirect to dashboard works

---

### Task 16: Manual Testing - Auth Loading State

**Effort:** XS (3 minutes)
**Dependencies:** Task 13
**Status:** Pending

**Description:** Verify the auth loading state displays correctly.

**Test Steps:**
1. Navigate to `/register/complete` page
2. Observe brief loading state (may be very quick)
3. Verify "Checking authentication..." text displays during auth check

**Verification:**
- [ ] Auth loading message displays correctly
- [ ] Spinner animation works

---

### Task 17: Manual Testing - Unauthenticated Redirect

**Effort:** XS (3 minutes)
**Dependencies:** Task 13
**Status:** Pending

**Description:** Verify unauthenticated users are redirected to login.

**Test Steps:**
1. Clear browser session/cookies
2. Navigate directly to `/register/complete`
3. Verify redirect to `/login` occurs

**Verification:**
- [ ] Unauthenticated users redirected to login
- [ ] No errors during redirect

---

### Task 18: Language Switching Verification

**Effort:** S (5 minutes)
**Dependencies:** Tasks 14-17
**Status:** Pending

**Description:** Verify that the component responds to language changes.

**Note:** This task validates the i18n integration works. Full translations for non-English languages are handled by separate generation tasks.

**Test Steps:**
1. Change browser/app language setting to French (or another supported language)
2. Navigate to registration complete page
3. Verify component attempts to load translations from correct locale file
4. If French translations don't exist yet, verify fallback to English works

**Verification:**
- [ ] Component responds to locale changes
- [ ] Fallback to English works when translations missing
- [ ] No console errors for missing translations

---

## Task Summary Table

| Task # | Description | Effort | Dependencies | Status |
|--------|-------------|--------|--------------|--------|
| 1 | Add translation keys to en.json | XS | None | Pending |
| 2 | Add common namespace keys | XS | Task 1 | Pending |
| 3 | Import useTranslations hook | XS | Tasks 1, 2 | Pending |
| 4 | Initialize translation hooks | XS | Task 3 | Pending |
| 5 | Replace auth loading state string | XS | Task 4 | Pending |
| 6 | Replace success state strings | XS | Task 4 | Pending |
| 7 | Replace header/branding strings | S | Task 4 | Pending |
| 8 | Replace info banner strings | XS | Task 4 | Pending |
| 9 | Replace form label/placeholder strings | XS | Task 4 | Pending |
| 10 | Replace submit button strings | XS | Task 4 | Pending |
| 11 | Replace sign out section strings | XS | Task 4 | Pending |
| 12 | Replace footer link strings | XS | Task 4 | Pending |
| 13 | Verify build compilation | XS | Tasks 1-12 | Pending |
| 14 | Manual testing - main flow | S | Task 13 | Pending |
| 15 | Manual testing - success state | S | Task 13 | Pending |
| 16 | Manual testing - auth loading | XS | Task 13 | Pending |
| 17 | Manual testing - unauthenticated redirect | XS | Task 13 | Pending |
| 18 | Language switching verification | S | Tasks 14-17 | Pending |

---

## Acceptance Criteria Checklist

From REQ-E02-046:

- [ ] All hardcoded strings replaced with translation function calls from the auth namespace
- [ ] Page metadata (title, description) uses translated strings
- [ ] Welcome headline and introductory text use translation keys (`auth.register.complete.title`, `auth.register.complete.description`)
- [ ] Profile setup instructions and step descriptions use translation keys
- [ ] All form field labels, placeholders, and helper text use translation keys
- [ ] Call-to-action button labels use translation keys (`auth.register.complete.form.submitButton`)
- [ ] Any tooltips, hints, or informational messages use translation keys
- [ ] Translation keys follow the established `auth.register.complete.*` namespace structure
- [ ] All extracted strings added to English base translation file (`/messages/en.json`)
- [ ] Component imports and uses appropriate translation hook (`useTranslations` from next-intl)
- [ ] Dynamic content interpolation formats correctly across languages
- [ ] Page layout remains intact with translated content
- [ ] All interactive elements remain functional
- [ ] All navigation links and buttons remain functional
- [ ] Success state displays correctly with translations
- [ ] Auth loading state displays correctly with translations

---

## Implementation Notes

### Hook Usage Pattern

The component is a client component, so use `useTranslations` hook:
```typescript
const t = useTranslations('auth.register.complete');
const tAuth = useTranslations('auth');
const tCommon = useTranslations('common');
```

### LoadingFallback Limitation

The `LoadingFallback` component is used as a Suspense fallback and cannot use React hooks. Keep the "Loading..." text as static English, or remove it entirely since it's only shown very briefly.

### Namespace Convention

- Component-specific strings: `auth.register.complete.*`
- Form-related strings: `auth.register.complete.form.*`
- Shared auth strings: `auth.*` (e.g., `auth.signOut`)
- Shared UI strings: `common.*` (e.g., `common.backToHome`)

### Email Display

The email address (`{emailFromUrl}`) is dynamic data and should NOT be translated. Keep it displayed after the translated "Signed in as:" label.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| LoadingFallback cannot use hooks | Low | Keep static "Loading..." text as brief fallback |
| Missing translation keys at runtime | Low | Add all keys in Task 1 before component changes |
| Success state render timing | Low | Translation hooks are stable, no timing issues |
| Form submission disruption | Low | Translation changes are display-only, logic unchanged |
| Sign out button regression | Low | Test sign out functionality explicitly |

---

## Definition of Done

- [ ] All 18 tasks completed and verified
- [ ] All acceptance criteria met
- [ ] TypeScript compilation passes
- [ ] Next.js build succeeds
- [ ] Main registration flow tested
- [ ] Success state tested
- [ ] Auth loading state verified
- [ ] Unauthenticated redirect tested
- [ ] Sign out functionality verified
- [ ] No console errors or warnings
- [ ] Code review completed (if applicable)

---

## References

- [Overview Document](./REQ-E02-046-update-srcappregistercompletepagetsx-overview.md)
- [Implementation Plan](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Requirements](./gen_requests_epic2.md) - REQ-E02-046
- [Pattern Reference: Register Success Page](./REQ-E02-045-update-srcappregistersuccesspagetsx-detailed.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Source File](/src/app/register/complete/page.tsx)
- [Translation File](/messages/en.json)

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A: Authentication & Registration*
*Task ID: 2A.8*
