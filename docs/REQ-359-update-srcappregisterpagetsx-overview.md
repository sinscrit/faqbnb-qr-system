# REQ-359: Update Registration Page Root Component for Internationalization

**Last Modified:** 2026-01-19 22:45:00 UTC
**Request Type:** ENHANCEMENT
**Size:** XS (Extra Small)
**Priority:** P2 - Medium
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.6
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Depends On:** Epic 1 (i18n foundation must be complete)

---

## Summary

The registration page root component (`/src/app/register/page.tsx`) displays a Suspense fallback with a hardcoded English loading message "Loading registration page..." that needs to be internationalized using the next-intl translation system established in Epic 1.

---

## Current State Analysis

### File Under Modification

**File:** `/src/app/register/page.tsx`

**Current Implementation:**
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

**Hardcoded Strings Identified:**
| String | Location | Proposed Translation Key |
|--------|----------|-------------------------|
| "Loading registration page..." | Line 11 | `auth.register.loading.page` |

**String Count:** 1

---

## Technical Context

### Established Translation Pattern

From the existing `LogoutButton.tsx` component (lines 7, 26-27, 69):

```tsx
// Import pattern for client components
import { useTranslations } from 'next-intl';

// Usage pattern (multiple namespaces if needed)
const t = useTranslations('auth');
const tCommon = useTranslations('common');

// String access pattern
{t('signOut')}
{tCommon('cancel')}
```

### Translation File Structure

From `/messages/en.json`, the `auth` namespace exists but lacks a `register` sub-section with loading states. The translation key should be added to extend the existing namespace.

### Dependencies

| Dependency | Status | Location |
|------------|--------|----------|
| next-intl package | ✅ Installed | `package.json` |
| i18n config | ✅ Configured | `/src/lib/i18n/config.ts` |
| IntlProvider | ✅ Set up | `/src/app/layout.tsx` |
| Translation files | ✅ Created | `/messages/*.json` |
| useTranslations hook | ✅ Available | `next-intl` |

---

## Implementation Approach

### Strategy

This is a minimal change to a small client component. The approach is:

1. Add the `useTranslations` hook import
2. Initialize the translation hook in the `RegistrationPageFallback` component
3. Replace the hardcoded loading string with the translated value
4. Add the corresponding translation key to all 6 language files

### Component Type

- **Type:** Client Component (has `'use client'` directive)
- **Hook to Use:** `useTranslations` from `next-intl`

### Translation Namespace Decision

**Recommended:** `auth.register.loading.page`

**Rationale:**
- Follows the established namespace hierarchy (`auth` namespace exists)
- Groups registration-related strings under `auth.register`
- `loading.page` clearly indicates this is a page-level loading state
- Consistent with the pattern defined in Plan-111 for auth namespace

### Alternative Considered

Using `common.loading.page` was considered but rejected because:
- The message is specific to the registration page context
- Other page loading messages may differ based on context
- The Plan-111 shows auth-specific loading messages under `auth.register`

---

## Authorized Files and Functions for Modification

### Primary File

| File Path | Function/Component | Modification Type |
|-----------|-------------------|-------------------|
| `/src/app/register/page.tsx` | `RegistrationPageFallback` | Add import, add hook, replace hardcoded string |

### Translation Files (Add Keys)

| File Path | Key to Add | Value |
|-----------|-----------|-------|
| `/messages/en.json` | `auth.register.loading.page` | `"Loading registration page..."` |
| `/messages/fr.json` | `auth.register.loading.page` | `"Chargement de la page d'inscription..."` |
| `/messages/es.json` | `auth.register.loading.page` | `"Cargando página de registro..."` |
| `/messages/de.json` | `auth.register.loading.page` | `"Registrierungsseite wird geladen..."` |
| `/messages/nl.json` | `auth.register.loading.page` | `"Registratiepagina laden..."` |
| `/messages/it.json` | `auth.register.loading.page` | `"Caricamento pagina di registrazione..."` |

---

## Implementation Tasks

### Task 1: Update Translation Files

**Files:** All 6 `/messages/*.json` files

**Action:** Add the `auth.register.loading` section with the `page` key.

**Before (en.json auth section):**
```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    ...
  }
}
```

**After (en.json auth section):**
```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    ...
    "register": {
      "loading": {
        "page": "Loading registration page..."
      }
    }
  }
}
```

### Task 2: Update RegistrationPageFallback Component

**File:** `/src/app/register/page.tsx`

**Changes:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook initialization: `const t = useTranslations('auth.register');`
3. Replace string: `"Loading registration page..."` → `{t('loading.page')}`

**Target Code After Modification:**
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

---

## Verification Checklist

### Functional Verification

- [ ] The component compiles without TypeScript errors
- [ ] The loading message displays correctly in English
- [ ] The Suspense boundary continues to work correctly
- [ ] No console errors about missing translation keys
- [ ] The loading spinner animation is unaffected

### Translation Verification

- [ ] Translation key exists in `/messages/en.json`
- [ ] Translation key exists in `/messages/fr.json`
- [ ] Translation key exists in `/messages/es.json`
- [ ] Translation key exists in `/messages/de.json`
- [ ] Translation key exists in `/messages/nl.json`
- [ ] Translation key exists in `/messages/it.json`

### Visual Verification

- [ ] Loading state styling is preserved
- [ ] Text layout is not broken (text fits in container)
- [ ] No visible flicker or layout shift during loading

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hook not initialized before render | Low | Low | Suspense boundary handles this |
| Missing translation key at runtime | Low | Low | Fallback to key name is acceptable for loading state |
| Build failure | Very Low | Medium | TypeScript will catch import errors |

---

## Effort Estimate

| Phase | Estimate |
|-------|----------|
| Translation file updates | 5 minutes |
| Component modification | 5 minutes |
| Testing & verification | 10 minutes |
| **Total** | **~20 minutes** |

---

## Acceptance Criteria (from REQ-359)

- [x] The loading message "Loading registration page..." is extracted to a translation key
- [ ] The RegistrationPageFallback component imports and uses the useTranslations hook from next-intl
- [ ] The translation key is added to the auth.register namespace in all language files
- [ ] The loading message displays in the user's selected language
- [ ] The Suspense boundary continues to function correctly with the translated content
- [ ] TypeScript compilation succeeds with no errors related to translation keys
- [ ] The component maintains existing styling, layout, and spinner animation
- [ ] No console errors appear related to missing translation keys

---

## References

- [Implementation Plan: Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [PRD: Epic 2](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2A: Authentication & Registration*
