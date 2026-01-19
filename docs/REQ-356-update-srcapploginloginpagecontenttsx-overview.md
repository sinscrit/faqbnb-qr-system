# REQ-356: Update LoginPageContent.tsx for Internationalization

**Created:** 2026-01-19 12:45 UTC
**Last Modified:** 2026-01-19 12:45 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.2
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High

---

## Overview

This document provides the implementation breakdown for internationalizing the `LoginPageContent.tsx` component. This is Task 2A.2 in the L10N Epic 2 implementation plan, which focuses on replacing all hardcoded English text strings with translation keys from the `auth` namespace using the next-intl framework.

The LoginPageContent component is a critical entry point for the application's authentication flow and contains approximately 20-25 user-facing strings that need to be extracted and translated.

---

## Current State Analysis

### Component Location
`/src/app/login/LoginPageContent.tsx`

### Component Type
- **Client Component** (`'use client'` directive)
- Uses `useTranslations` hook from `next-intl` (not `getTranslations`)

### Existing Dependencies
```typescript
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import { AlertCircle, CheckCircle, Home } from 'lucide-react';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
```

### Hardcoded Strings Inventory

| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 165 | `'Completing authentication...'` | `auth.login.loading.authenticating` | Loading state |
| 165 | `'Loading authentication...'` | `auth.login.loading.loading` | Loading state |
| 168-169 | `'Debug: Check console for LOGIN_PAGE_DEBUG logs (REQ-025)'` | Remove or keep as-is | Debug text - consider removing from production |
| 134 | `'Completing Google sign-in...'` | `auth.login.messages.completingGoogle` | OAuth info message |
| 178 | `'Login successful! Redirecting...'` | `auth.login.messages.success` | Success message |
| 242 | `'FAQBNB'` | N/A | Brand name - keep as-is |
| 243 | `'Admin Access'` | `auth.login.adminAccess` | Subtitle |
| 248 | `'Sign in to your account'` | `auth.login.title` | Page title |
| 251 | `'Access the FAQBNB administration panel'` | `auth.login.subtitle` | Page subtitle |
| 275 | `'Back to Home'` | `auth.login.backToHome` | Navigation link |
| 289 | `'Clear Session'` | `auth.login.clearSession` | Action button |
| 296 | `'© 2024 FAQBNB. All rights reserved.'` | `auth.login.copyright` | Copyright notice (year should be dynamic) |
| 331 | `'Secure Access'` | `auth.login.secureAccess` | Security notice title |
| 334-336 | `'This area is restricted to authorized administrators only. All access attempts are logged and monitored.'` | `auth.login.secureAccessDescription` | Security notice description |
| 236 | `'FAQBNB Logo'` | `auth.login.logoAlt` | Image alt text (accessibility) |

---

## Implementation Approach

### Pattern Reference
Follow the pattern established in `LogoutButton.tsx`:
```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('auth.login');
  const tCommon = useTranslations('common');

  return <h1>{t('title')}</h1>;
}
```

### Translation Namespace Structure
The `auth.login` namespace in `/messages/en.json` needs to be expanded with the following structure:

```json
{
  "auth": {
    "login": {
      "title": "Sign in to your account",
      "subtitle": "Access the FAQBNB administration panel",
      "adminAccess": "Admin Access",
      "backToHome": "Back to Home",
      "clearSession": "Clear Session",
      "secureAccess": "Secure Access",
      "secureAccessDescription": "This area is restricted to authorized administrators only. All access attempts are logged and monitored.",
      "copyright": "© {year} FAQBNB. All rights reserved.",
      "logoAlt": "FAQBNB Logo",
      "loading": {
        "authenticating": "Completing authentication...",
        "loading": "Loading authentication..."
      },
      "messages": {
        "success": "Login successful! Redirecting...",
        "completingGoogle": "Completing Google sign-in..."
      }
    }
  }
}
```

---

## Authorized Files and Functions for Modification

### Primary File
| File Path | Modification Scope |
|-----------|-------------------|
| `/src/app/login/LoginPageContent.tsx` | Add import, replace all hardcoded strings with `t()` calls |

### Translation Files
| File Path | Modification Scope |
|-----------|-------------------|
| `/messages/en.json` | Add/update `auth.login` namespace entries |
| `/messages/fr.json` | Add French translations for `auth.login` |
| `/messages/es.json` | Add Spanish translations for `auth.login` |
| `/messages/de.json` | Add German translations for `auth.login` |
| `/messages/nl.json` | Add Dutch translations for `auth.login` |
| `/messages/it.json` | Add Italian translations for `auth.login` |

### Functions to Modify
| Function/Component | Location | Changes |
|-------------------|----------|---------|
| `LoginPageContent` | Line 17-344 | Add `useTranslations` hook, replace strings |
| `MessageAlert` (inner component) | Line 189-226 | No changes needed - receives translated text via props |
| Loading state render | Line 160-173 | Replace hardcoded loading messages |
| Main render return | Line 228-343 | Replace all user-facing strings |

---

## Implementation Tasks

### Task 1: Update Translation Files
**Estimate:** Small
**Description:** Add the required translation keys to all 6 language files.

**Steps:**
1. Open `/messages/en.json`
2. Expand the `auth.login` namespace with all identified strings
3. Use ICU format for the copyright year: `{year}`
4. Copy structure to other language files and translate

### Task 2: Add useTranslations Import
**Estimate:** Trivial
**Description:** Add the next-intl import to LoginPageContent.tsx.

**Code Change:**
```typescript
// Add to existing imports
import { useTranslations } from 'next-intl';
```

### Task 3: Initialize Translation Hooks
**Estimate:** Trivial
**Description:** Add translation hook initialization inside the component.

**Code Change (after line 20):**
```typescript
const t = useTranslations('auth.login');
```

### Task 4: Update Loading State
**Estimate:** Small
**Description:** Replace hardcoded loading messages with translation calls.

**Location:** Lines 160-173

**Before:**
```tsx
<p className="text-gray-600">
  {authState === 'LOADING' ? 'Completing authentication...' : 'Loading authentication...'}
</p>
```

**After:**
```tsx
<p className="text-gray-600">
  {authState === 'LOADING' ? t('loading.authenticating') : t('loading.loading')}
</p>
```

### Task 5: Update Success Handler
**Estimate:** Trivial
**Description:** Replace hardcoded success message.

**Location:** Lines 175-180

**Before:**
```typescript
setLoginMessage({
  type: 'success',
  message: 'Login successful! Redirecting...',
});
```

**After:**
```typescript
setLoginMessage({
  type: 'success',
  message: t('messages.success'),
});
```

### Task 6: Update OAuth Message
**Estimate:** Trivial
**Description:** Replace hardcoded Google sign-in message.

**Location:** Lines 132-135

**Before:**
```typescript
setLoginMessage({
  type: 'info',
  message: 'Completing Google sign-in...',
});
```

**After:**
```typescript
setLoginMessage({
  type: 'info',
  message: t('messages.completingGoogle'),
});
```

### Task 7: Update Header Section
**Estimate:** Small
**Description:** Replace hardcoded header text.

**Location:** Lines 231-253

**Changes:**
- Line 236: `alt={t('logoAlt')}`
- Line 243: `<p className="...">{t('adminAccess')}</p>`
- Line 248: `{t('title')}`
- Line 251: `{t('subtitle')}`

### Task 8: Update Footer Links Section
**Estimate:** Small
**Description:** Replace footer navigation and action text.

**Location:** Lines 267-299

**Changes:**
- Line 275: `{t('backToHome')}`
- Line 289: `{t('clearSession')}`
- Line 296: `{t('copyright', { year: new Date().getFullYear() })}`

### Task 9: Update Security Notice
**Estimate:** Small
**Description:** Replace security notice text.

**Location:** Lines 311-340

**Changes:**
- Line 331: `{t('secureAccess')}`
- Lines 334-336: `{t('secureAccessDescription')}`

### Task 10: Remove or Conditionalize Debug Text
**Estimate:** Trivial
**Description:** The debug text on lines 167-169 should either be removed from production or made conditional.

**Recommendation:** Remove or wrap in development-only check:
```tsx
{process.env.NODE_ENV === 'development' && (
  <p className="text-xs text-gray-400 mt-2">
    Debug: Check console for LOGIN_PAGE_DEBUG logs (REQ-025)
  </p>
)}
```

---

## Dependencies

### Required Before Implementation
- [x] Epic 1 Foundation complete (next-intl installed, IntlProvider configured)
- [ ] Task 2A.1: Create `auth` namespace structure (should be complete or done in parallel)

### Components This Affects
- None - LoginPageContent is a leaf component

### Components That Depend on This
- `/src/app/login/page.tsx` - Parent page (no changes needed)

---

## Testing Requirements

### Manual Testing Checklist
- [ ] Page loads without errors in English (default)
- [ ] All text displays correctly in each of the 6 languages
- [ ] Loading states show translated messages
- [ ] Success message appears translated after successful login
- [ ] Google OAuth flow shows translated "Completing sign-in" message
- [ ] Copyright year displays dynamically
- [ ] "Clear Session" button text is translated
- [ ] "Back to Home" link text is translated
- [ ] Security notice displays translated content
- [ ] Image alt text is translated (check in accessibility tools)
- [ ] No console errors related to missing translations

### Accessibility Verification
- [ ] Logo `alt` attribute contains translated text
- [ ] All interactive elements maintain proper ARIA labels
- [ ] Screen reader announces translated content correctly

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys | Low | Medium | Build-time check with next-intl |
| Text overflow in other languages | Medium | Low | German text is ~30% longer - verify layout |
| Breaking existing tests | Low | Medium | Update any snapshot tests |
| OAuth flow regression | Low | High | Test Google sign-in flow thoroughly |

---

## Acceptance Criteria Verification

| Criterion | Implementation Task |
|-----------|---------------------|
| All hardcoded text strings identified and catalogued | String Inventory table above |
| Page title and subtitle use translation keys | Task 7 |
| Loading state messages use translation keys | Task 4 |
| Success confirmation messages extracted | Task 5 |
| OAuth flow messages use translation keys | Task 6 |
| Security notice internationalized | Task 9 |
| Footer link text uses translation keys | Task 8 |
| Copyright notice with dynamic year | Task 8 |
| Component imports useTranslations | Task 2 |
| All auth flows function correctly | Testing Requirements |
| Existing styling maintained | No CSS changes required |
| Accessibility attributes maintained | Task 7 (logo alt) |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Definition](/docs/gen_requests_epic2.md#req-356)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [i18n Configuration](/src/lib/i18n/config.ts)

---

## Appendix: Complete String Extraction Map

```
LoginPageContent.tsx String Extraction

┌─────────────────────────────────────────────────────────────────┐
│ LOADING STATE (lines 160-173)                                   │
├─────────────────────────────────────────────────────────────────┤
│ • "Completing authentication..." → t('loading.authenticating')  │
│ • "Loading authentication..."    → t('loading.loading')         │
│ • Debug text                     → Remove/conditionalize        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ MESSAGES (lines 132-135, 175-180)                               │
├─────────────────────────────────────────────────────────────────┤
│ • "Completing Google sign-in..." → t('messages.completingGoogle')│
│ • "Login successful! Redirecting..."→ t('messages.success')     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HEADER SECTION (lines 231-253)                                  │
├─────────────────────────────────────────────────────────────────┤
│ • alt="FAQBNB Logo"              → alt={t('logoAlt')}           │
│ • "FAQBNB"                       → Keep as brand name           │
│ • "Admin Access"                 → t('adminAccess')             │
│ • "Sign in to your account"      → t('title')                   │
│ • "Access the FAQBNB..."         → t('subtitle')                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FOOTER SECTION (lines 267-299)                                  │
├─────────────────────────────────────────────────────────────────┤
│ • "Back to Home"                 → t('backToHome')              │
│ • "Clear Session"                → t('clearSession')            │
│ • "© 2024 FAQBNB. All rights..." → t('copyright', { year })     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SECURITY NOTICE (lines 311-340)                                 │
├─────────────────────────────────────────────────────────────────┤
│ • "Secure Access"                → t('secureAccess')            │
│ • "This area is restricted..."   → t('secureAccessDescription') │
└─────────────────────────────────────────────────────────────────┘
```

---

*Document generated for FAQBNB L10N Epic 2 - Task 2A.2*
