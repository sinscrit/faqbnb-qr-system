# REQ-359: Update Registration Page Root Component - Detailed Task Breakdown

**Last Modified:** 2026-01-19 23:15:00 UTC
**Request Type:** ENHANCEMENT
**Size:** XS (Extra Small)
**Priority:** P2 - Medium
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.6
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Overview Document:** REQ-359-update-srcappregisterpagetsx-overview.md
**Depends On:** Epic 1 (i18n foundation must be complete)

---

## Executive Summary

This document provides granular, implementation-ready tasks for internationalizing the registration page root component (`/src/app/register/page.tsx`). The component contains a single hardcoded English string "Loading registration page..." in a Suspense fallback that needs to be replaced with a translated value using next-intl.

**Total Estimated Story Points:** 1
**Total Tasks:** 8

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 i18n foundation is complete
- [ ] `next-intl` package is installed (`npm list next-intl`)
- [ ] IntlProvider is configured in `/src/app/layout.tsx`
- [ ] Translation files exist in `/messages/` directory (en.json, fr.json, es.json, de.json, nl.json, it.json)
- [ ] `useTranslations` hook is available from `next-intl`

---

## Task Breakdown

### Task 1: Verify i18n Infrastructure (0.1 SP)

**Objective:** Confirm all dependencies from Epic 1 are in place before making changes.

**Steps:**
1. Verify `next-intl` is installed:
   ```bash
   npm list next-intl
   ```
2. Confirm `/messages/en.json` exists and is valid JSON
3. Verify the `auth` namespace exists in `/messages/en.json`
4. Check that IntlProvider is configured in `/src/app/layout.tsx`

**Verification:**
- [ ] `next-intl` package version is displayed (should be 3.x or later)
- [ ] `/messages/en.json` file loads without JSON parse errors
- [ ] `auth` namespace key exists in `en.json`

**Exit Criteria:** All infrastructure checks pass; proceed to Task 2.

---

### Task 2: Add Translation Key to English File (0.1 SP)

**Objective:** Add the `auth.register.loading.page` translation key to the English messages file.

**File to Modify:** `/messages/en.json`

**Current State of `auth` namespace:**
```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "confirmLogout": "Confirm Logout",
    "confirmSignOutMessage": "Are you sure you want to sign out?",
    ...
  }
}
```

**Target State:**
```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "confirmLogout": "Confirm Logout",
    "confirmSignOutMessage": "Are you sure you want to sign out?",
    ...,
    "register": {
      "loading": {
        "page": "Loading registration page..."
      }
    }
  }
}
```

**Implementation Steps:**
1. Open `/messages/en.json`
2. Locate the `auth` object (line 37 onwards)
3. Add the `register.loading.page` nested structure within the `auth` namespace
4. Ensure proper JSON formatting (commas, no trailing commas)
5. Save and validate JSON syntax

**Verification:**
- [ ] JSON file parses without errors
- [ ] Key path `auth.register.loading.page` is accessible
- [ ] Value is exactly: `"Loading registration page..."`

---

### Task 3: Add Translation Key to French File (0.1 SP)

**Objective:** Add the French translation for the loading message.

**File to Modify:** `/messages/fr.json`

**Key to Add:** `auth.register.loading.page`
**Value:** `"Chargement de la page d'inscription..."`

**Implementation Steps:**
1. Open `/messages/fr.json`
2. Locate the `auth` namespace
3. Add the same nested structure as Task 2
4. Insert the French translation value
5. Validate JSON syntax

**Verification:**
- [ ] JSON file parses without errors
- [ ] French translation is grammatically correct
- [ ] Key structure matches English file exactly

---

### Task 4: Add Translation Key to Spanish File (0.1 SP)

**Objective:** Add the Spanish translation for the loading message.

**File to Modify:** `/messages/es.json`

**Key to Add:** `auth.register.loading.page`
**Value:** `"Cargando pagina de registro..."`

**Implementation Steps:**
1. Open `/messages/es.json`
2. Locate the `auth` namespace
3. Add the nested structure matching other language files
4. Insert the Spanish translation value
5. Validate JSON syntax

**Verification:**
- [ ] JSON file parses without errors
- [ ] Spanish translation is grammatically correct
- [ ] Key structure matches English file exactly

---

### Task 5: Add Translation Key to German File (0.1 SP)

**Objective:** Add the German translation for the loading message.

**File to Modify:** `/messages/de.json`

**Key to Add:** `auth.register.loading.page`
**Value:** `"Registrierungsseite wird geladen..."`

**Implementation Steps:**
1. Open `/messages/de.json`
2. Locate the `auth` namespace
3. Add the nested structure matching other language files
4. Insert the German translation value
5. Validate JSON syntax

**Verification:**
- [ ] JSON file parses without errors
- [ ] German translation is grammatically correct
- [ ] Key structure matches English file exactly

---

### Task 6: Add Translation Key to Dutch File (0.1 SP)

**Objective:** Add the Dutch translation for the loading message.

**File to Modify:** `/messages/nl.json`

**Key to Add:** `auth.register.loading.page`
**Value:** `"Registratiepagina laden..."`

**Implementation Steps:**
1. Open `/messages/nl.json`
2. Locate the `auth` namespace
3. Add the nested structure matching other language files
4. Insert the Dutch translation value
5. Validate JSON syntax

**Verification:**
- [ ] JSON file parses without errors
- [ ] Dutch translation is grammatically correct
- [ ] Key structure matches English file exactly

---

### Task 7: Add Translation Key to Italian File (0.1 SP)

**Objective:** Add the Italian translation for the loading message.

**File to Modify:** `/messages/it.json`

**Key to Add:** `auth.register.loading.page`
**Value:** `"Caricamento pagina di registrazione..."`

**Implementation Steps:**
1. Open `/messages/it.json`
2. Locate the `auth` namespace
3. Add the nested structure matching other language files
4. Insert the Italian translation value
5. Validate JSON syntax

**Verification:**
- [ ] JSON file parses without errors
- [ ] Italian translation is grammatically correct
- [ ] Key structure matches English file exactly

---

### Task 8: Update Registration Page Component (0.2 SP)

**Objective:** Modify the `RegistrationPageFallback` component to use the translation hook.

**File to Modify:** `/src/app/register/page.tsx`

**Current Code:**
```tsx
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

export default function RegistrationPage() {
  return (
    <Suspense fallback={<RegistrationPageFallback />}>
      <RegistrationPageContent />
    </Suspense>
  );
}
```

**Target Code:**
```tsx
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

export default function RegistrationPage() {
  return (
    <Suspense fallback={<RegistrationPageFallback />}>
      <RegistrationPageContent />
    </Suspense>
  );
}
```

**Implementation Steps:**

1. **Add Import Statement:**
   - Add `import { useTranslations } from 'next-intl';` after the existing imports
   - Place on line 3, after the React Suspense import

2. **Add Hook to RegistrationPageFallback:**
   - Add `const t = useTranslations('auth.register');` as the first line inside the `RegistrationPageFallback` function
   - This initializes the translation hook with the `auth.register` namespace

3. **Replace Hardcoded String:**
   - Change `<p className="text-gray-600">Loading registration page...</p>`
   - To: `<p className="text-gray-600">{t('loading.page')}</p>`

4. **Save and Verify:**
   - Save the file
   - Ensure no syntax errors
   - Run TypeScript compilation check

**Verification:**
- [ ] Import statement added correctly on line 3
- [ ] Hook initialized inside `RegistrationPageFallback` function
- [ ] String replacement uses `{t('loading.page')}` syntax (JSX expression)
- [ ] File compiles without TypeScript errors
- [ ] No ESLint warnings related to the changes

---

## Post-Implementation Verification

### Functional Verification Checklist

| Test | Expected Result | Status |
|------|-----------------|--------|
| TypeScript compilation | No errors | [ ] |
| Build process | Completes successfully | [ ] |
| English loading message displays | "Loading registration page..." | [ ] |
| Suspense boundary works | Fallback shows during load | [ ] |
| Spinner animation | Continues to animate | [ ] |
| Console errors | None related to translations | [ ] |

### Visual Verification Checklist

| Test | Expected Result | Status |
|------|-----------------|--------|
| Loading spinner visible | Centered, blue, animated | [ ] |
| Text positioning | Centered below spinner | [ ] |
| Text styling | Gray color (text-gray-600) | [ ] |
| Layout intact | Centered vertically and horizontally | [ ] |
| No text overflow | Message fits in container | [ ] |

### Translation File Verification

Run this validation script or manually check:

```bash
# Verify all translation files have the key
for lang in en fr es de nl it; do
  echo "Checking messages/$lang.json..."
  node -e "const f=require('./messages/$lang.json'); console.log('$lang:', f.auth?.register?.loading?.page || 'MISSING')"
done
```

Expected output:
```
en: Loading registration page...
fr: Chargement de la page d'inscription...
es: Cargando pagina de registro...
de: Registrierungsseite wird geladen...
nl: Registratiepagina laden...
it: Caricamento pagina di registrazione...
```

---

## Testing Commands

```bash
# 1. TypeScript check
npx tsc --noEmit

# 2. Build check
npm run build

# 3. Development server
npm run dev

# 4. Navigate to registration page
# http://localhost:3000/register
# Observe loading state (may need to throttle network in DevTools to see it)
```

---

## Rollback Plan

If issues are encountered:

1. **Component Rollback:**
   - Revert `/src/app/register/page.tsx` to original state (remove import, hook, restore hardcoded string)

2. **Translation File Rollback:**
   - Remove the `register` key from the `auth` namespace in all 6 language files

3. **Verification After Rollback:**
   - Run `npm run build` to confirm app builds
   - Test registration page loads correctly

---

## Dependencies

### Blocking Dependencies (Must Complete First)
- Epic 1 foundation (i18n setup)
- REQ-229: Install next-intl package
- REQ-230: Create i18n configuration
- REQ-231: Configure IntlProvider

### Non-Blocking Dependencies (Can Run in Parallel)
- None

### Dependent Tasks (Blocked by This Task)
- None

---

## Reference Pattern

This implementation follows the established pattern from `LogoutButton.tsx`:

```tsx
// /src/components/LogoutButton.tsx (lines 7, 26-27, 69)
import { useTranslations } from 'next-intl';

// Inside component:
const t = useTranslations('auth');
const tCommon = useTranslations('common');

// Usage:
{t('signOut')}
{tCommon('cancel')}
```

---

## Translation Reference Table

| Language | Key | Value |
|----------|-----|-------|
| English (en) | `auth.register.loading.page` | `Loading registration page...` |
| French (fr) | `auth.register.loading.page` | `Chargement de la page d'inscription...` |
| Spanish (es) | `auth.register.loading.page` | `Cargando pagina de registro...` |
| German (de) | `auth.register.loading.page` | `Registrierungsseite wird geladen...` |
| Dutch (nl) | `auth.register.loading.page` | `Registratiepagina laden...` |
| Italian (it) | `auth.register.loading.page` | `Caricamento pagina di registrazione...` |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Task(s) | Verification |
|--------------------|---------|--------------|
| Loading message extracted to translation key | Tasks 2-7 | Translation files contain key |
| RegistrationPageFallback uses useTranslations hook | Task 8 | Import and hook present |
| Translation key in auth.register namespace | Tasks 2-7 | Key path is `auth.register.loading.page` |
| Loading message displays in user's language | Task 8 | Manual testing with language switch |
| Suspense boundary functions correctly | Task 8 | Fallback displays during load |
| TypeScript compilation succeeds | Task 8 | `tsc --noEmit` passes |
| Existing styling and animation maintained | Task 8 | Visual verification |
| No console errors for missing keys | All Tasks | Browser console check |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation key at runtime | Low | Low | Verified in Tasks 2-7; next-intl shows key name as fallback |
| Hook not available during SSR | Very Low | Medium | Component is client-side (`'use client'`) |
| Build failure | Very Low | Medium | TypeScript catches import errors |
| Layout shift from different text lengths | Very Low | Low | All translations are similar length |

---

## Notes

- This is an XS (Extra Small) task with minimal complexity
- The component is client-side only, so `useTranslations` hook is appropriate (not `getTranslations`)
- The Suspense fallback should continue to work as expected since the hook is called within a client component
- Loading states are brief, so the translation impact is minimal but important for consistency

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2A: Authentication & Registration*
*Task 2A.6: Update `/src/app/register/page.tsx`*
