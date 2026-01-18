# REQ-234: Verify Sample Component with t() Function - Implementation Overview

**Generated:** 2026-01-18 00:00:00 UTC
**Last Modified:** 2026-01-18 00:00:00 UTC
**Request Reference:** REQ-234 - Verify Sample Component with t() Function
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 2, Task 2.6)
**Status:** Ready for Implementation

---

## 1. Request Summary

Update one existing component to use the next-intl `t()` translation function and verify that hot reload works correctly during development. This task validates that the entire i18n framework integration is working end-to-end by demonstrating a real component using translations from the `/messages/` JSON files.

**Scope:**
- Select a simple, highly-visible existing component for translation verification
- Import and use `useTranslations` hook from `next-intl`
- Replace hardcoded strings with `t()` function calls
- Verify hot reload updates translations without full page refresh
- Document the verification process and results

**Out of Scope:**
- Translating all components (future phases)
- Adding LanguageSwitcher UI (Task 5.3)
- Database-backed translations (Phases 3-5)
- Creating new components for testing purposes
- Full application localization audit

---

## 2. Current State Analysis

### Prerequisites (Must be completed before this task)

| Task | Description | Status | Dependency |
|------|-------------|--------|------------|
| Task 2.1 | Install and configure next-intl | Required | `/messages/` directory with locale files |
| Task 2.2 | Create i18n configuration module | Required | `/src/lib/i18n/config.ts`, `/src/lib/i18n/request.ts` |
| Task 2.3 | Update next.config.ts for i18n | Required | next-intl plugin configuration |
| Task 2.4 | Create IntlProvider wrapper | Required | `NextIntlClientProvider` in root layout |
| Task 2.5 | Create initial translation file structure | Required | Populated `/messages/en.json` |

### Existing Technology Stack

| Technology | Version | Relevance |
|------------|---------|-----------|
| Next.js | 15.5.9 | App Router with server/client components |
| React | 19.1.0 | Client component hooks support |
| TypeScript | ^5 | Type-safe translation keys |
| next-intl | latest | i18n framework (installed in Task 2.1) |

### Candidate Components for Verification

Based on codebase analysis, these components are good candidates for verification testing:

| Component | Location | Visibility | Complexity | Recommendation |
|-----------|----------|------------|------------|----------------|
| **LogoutButton** | `/src/components/LogoutButton.tsx` | High | Low | **Primary candidate** - Simple, clear strings |
| VersionFooter | `/src/components/VersionFooter.tsx` | High | Very Low | Too simple (no user-facing text) |
| ConfirmationModal (inline) | `/src/components/LogoutButton.tsx` | Medium | Low | Good secondary test |
| LoginForm | `/src/components/LoginForm.tsx` | High | Medium | Good but more complex |

**Selected Component: LogoutButton**

The `LogoutButton` component is ideal because:
1. It's a simple, self-contained `'use client'` component
2. Contains clearly translatable UI strings ("Confirm Logout", "Cancel", "Sign Out", etc.)
3. Includes a nested modal with additional translatable content
4. High visibility - appears in dashboard header
5. Low risk if something goes wrong

### Current LogoutButton Strings

From `/src/components/LogoutButton.tsx` analysis:

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 30 | `"Confirm Logout"` | `auth.confirmLogout` |
| 31 | `"Are you sure you want to sign out?"` | `auth.confirmSignOutMessage` |
| 36 | `"Cancel"` | `common.cancel` |
| 47 | `"Sign Out"` | `auth.signOut` |
| 130 | `"Sign Out"` (title attr) | `auth.signOut` |
| 161 | `"Sign Out"` | `auth.signOut` |
| 186 | `"Sign Out"` | `auth.signOut` |

---

## 3. Technical Approach

### next-intl Client Component Pattern

For client components using `'use client'` directive:

```typescript
'use client';

import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('namespace');

  return <h1>{t('keyName')}</h1>;
}
```

### Hot Reload Verification

Hot reload with next-intl works when:
1. Development server is running (`npm run dev`)
2. Translation files are properly watched by the build system
3. Components use the `useTranslations` hook correctly
4. The IntlProvider is properly configured in the root layout

Expected behavior:
- Edit a translation in `/messages/en.json`
- Save the file
- UI updates automatically without manual refresh
- Browser console shows no errors

### Translation Key Structure

Using established namespace pattern from `/messages/en.json`:

```json
{
  "common": {
    "cancel": "Cancel"
  },
  "auth": {
    "signOut": "Sign Out",
    "confirmLogout": "Confirm Logout",
    "confirmSignOutMessage": "Are you sure you want to sign out?"
  }
}
```

---

## 4. Implementation Tasks

### Task 2.6.1: Add Missing Translation Keys

**Action:** Update `/messages/en.json` with LogoutButton-specific keys

**File:** `/messages/en.json`

**Add to `auth` namespace:**
```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "signUp": "Sign Up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "continueWithGoogle": "Continue with Google",
    "rememberMe": "Remember me",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "confirmLogout": "Confirm Logout",
    "confirmSignOutMessage": "Are you sure you want to sign out?"
  }
}
```

**Verification:**
- JSON file is valid (no syntax errors)
- Keys are accessible via `t('confirmLogout')` and `t('confirmSignOutMessage')` when using `useTranslations('auth')`

### Task 2.6.2: Update LogoutButton to Use Translations

**Action:** Modify component to use `useTranslations` hook

**File:** `/src/components/LogoutButton.tsx`

**Changes Required:**

1. **Add import (top of file, after existing imports):**
```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hooks in LogoutButton component (inside function, before early return):**
```typescript
export default function LogoutButton({
  variant = 'button',
  size = 'md',
  showConfirmation = false,
  onLogoutStart,
  onLogoutComplete,
  className = '',
}: LogoutButtonProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  const { signOut, user } = useAuth();
  // ... rest of component
```

3. **Add hooks in ConfirmationModal component (inside function):**
```typescript
function ConfirmationModal({ isOpen, onConfirm, onCancel, loading }: ConfirmationModalProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  if (!isOpen) return null;
  // ... rest of component
```

4. **Replace hardcoded strings in ConfirmationModal:**

| Line | Before | After |
|------|--------|-------|
| ~30 | `"Confirm Logout"` | `{t('confirmLogout')}` |
| ~31 | `"Are you sure you want to sign out?"` | `{t('confirmSignOutMessage')}` |
| ~36 | `"Cancel"` | `{tCommon('cancel')}` |
| ~47 | `'Sign Out'` | `{t('signOut')}` |

5. **Replace hardcoded strings in LogoutButton:**

| Location | Before | After |
|----------|--------|-------|
| Icon variant title | `"Sign Out"` | `{t('signOut')}` |
| Text variant | `Sign Out` | `{t('signOut')}` |
| Button variant | `Sign Out` | `{t('signOut')}` |

### Task 2.6.3: Update Other Locale Files (Stub Values)

**Action:** Add corresponding keys to all locale files

**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

**Add to each file's `auth` namespace:**

**French (`fr.json`):**
```json
"confirmLogout": "Confirmer la deconnexion",
"confirmSignOutMessage": "Etes-vous sur de vouloir vous deconnecter?"
```

**Spanish (`es.json`):**
```json
"confirmLogout": "Confirmar cierre de sesion",
"confirmSignOutMessage": "Esta seguro de que desea cerrar sesion?"
```

**German (`de.json`):**
```json
"confirmLogout": "Abmelden bestatigen",
"confirmSignOutMessage": "Sind Sie sicher, dass Sie sich abmelden mochten?"
```

**Dutch (`nl.json`):**
```json
"confirmLogout": "Uitloggen bevestigen",
"confirmSignOutMessage": "Weet u zeker dat u wilt uitloggen?"
```

**Italian (`it.json`):**
```json
"confirmLogout": "Conferma disconnessione",
"confirmSignOutMessage": "Sei sicuro di voler disconnetterti?"
```

### Task 2.6.4: Verify Hot Reload Functionality

**Action:** Test hot reload with live translation changes

**Verification Steps:**

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Dashboard:**
   - Open browser to `http://localhost:3000/dashboard`
   - Log in if required

3. **Trigger LogoutButton Display:**
   - Locate logout button in navigation/header
   - Click to show confirmation modal (if `showConfirmation` is enabled)
   - Observe current "Sign Out", "Cancel", "Confirm Logout" text

4. **Modify Translation:**
   - Edit `/messages/en.json`
   - Change `"signOut": "Sign Out"` to `"signOut": "Log Out"`
   - Save the file

5. **Observe Hot Reload:**
   - Watch the browser UI
   - Button text should change from "Sign Out" to "Log Out" automatically
   - No manual page refresh should be required
   - Console should show no errors

6. **Revert Change:**
   - Change back to `"signOut": "Sign Out"`
   - Verify text reverts

### Task 2.6.5: Document Verification Results

**Action:** Create verification log

**Document at end of implementation:**

```markdown
## Verification Log

**Date:** [YYYY-MM-DD HH:MM:SS UTC]
**Tester:** Claude (automated implementation agent)

### Test 1: Component Renders with Translations
- [ ] LogoutButton displays translated text
- [ ] ConfirmationModal displays translated text
- [ ] No console errors related to translations
- [ ] No missing key warnings

### Test 2: Hot Reload Works
- [ ] Translation file change detected
- [ ] UI updates without page refresh
- [ ] Change appears within 1-2 seconds
- [ ] Multiple edits work correctly

### Test 3: Build Verification
- [ ] `npm run build` completes successfully
- [ ] No type errors related to translations
- [ ] Production build functions correctly

### Issues Found
- [None expected / List any issues]

### Notes
- [Any observations about behavior]
```

---

## 5. Authorized Files and Functions for Modification

### Files to MODIFY

| File Path | Lines | Changes | Scope |
|-----------|-------|---------|-------|
| `/src/components/LogoutButton.tsx` | 1-196 | Add useTranslations hooks, replace strings | Import, ConfirmationModal function, LogoutButton function |
| `/messages/en.json` | auth namespace | Add `confirmLogout`, `confirmSignOutMessage` keys | Auth section only |
| `/messages/fr.json` | auth namespace | Add matching keys | Auth section only |
| `/messages/es.json` | auth namespace | Add matching keys | Auth section only |
| `/messages/de.json` | auth namespace | Add matching keys | Auth section only |
| `/messages/nl.json` | auth namespace | Add matching keys | Auth section only |
| `/messages/it.json` | auth namespace | Add matching keys | Auth section only |

### Functions to MODIFY

| File | Function | Changes |
|------|----------|---------|
| `/src/components/LogoutButton.tsx` | `ConfirmationModal` | Add `useTranslations` hooks, replace hardcoded strings |
| `/src/components/LogoutButton.tsx` | `LogoutButton` | Add `useTranslations` hooks, replace hardcoded strings |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/app/layout.tsx` | Verify IntlProvider is configured (prerequisite check) |
| `/src/lib/i18n/config.ts` | Verify locale configuration (prerequisite check) |
| `/next.config.ts` | Verify next-intl plugin (prerequisite check) |
| `/package.json` | Verify next-intl is installed |

### Files NOT to MODIFY

| File Path | Reason |
|-----------|--------|
| `/src/app/layout.tsx` | Task 2.4 should have already configured IntlProvider |
| `/next.config.ts` | Task 2.3 should have already configured plugin |
| `/src/middleware.ts` | Language detection is a Phase 5 task |
| Any other components | This task is limited to sample verification only |

---

## 6. Dependencies

### Internal Dependencies (Must be Complete)

| Task | Status | Verification |
|------|--------|--------------|
| Task 2.1 | Required | `npm list next-intl` shows package installed |
| Task 2.2 | Required | `/src/lib/i18n/config.ts` exists |
| Task 2.3 | Required | `next.config.ts` has next-intl plugin |
| Task 2.4 | Required | `layout.tsx` has NextIntlClientProvider |
| Task 2.5 | Required | `/messages/en.json` has base structure |

### Downstream Dependencies (Tasks Blocked by This)

| Task | Description |
|------|-------------|
| Phase 3 Tasks | Translation service can begin once framework is verified |
| Phase 5 Tasks | Language switching can proceed |
| All future component translations | Pattern established here applies to all |

---

## 7. Acceptance Criteria

From Plan-110 Task 2.6:

- [ ] One existing component is updated to use translations via `t()` function
- [ ] Hot reload works correctly for translation changes
- [ ] Component renders correctly with English translations
- [ ] Component renders correctly when locale changes (if LanguageSwitcher exists)
- [ ] No console errors or warnings related to translations
- [ ] Build passes with translated component

Additional verification criteria:

- [ ] `useTranslations` hook is properly imported from `next-intl`
- [ ] Translation keys exist in all 6 locale files
- [ ] Hardcoded strings in LogoutButton are replaced with `t()` calls
- [ ] ConfirmationModal (nested component) also uses translations
- [ ] Development server continues to work during testing
- [ ] Production build (`npm run build`) completes successfully

---

## 8. Testing Strategy

### Pre-Implementation Checks

1. **Verify Prerequisites:**
   ```bash
   # Check next-intl is installed
   npm list next-intl

   # Check messages directory exists
   ls -la messages/

   # Check i18n config exists
   ls -la src/lib/i18n/
   ```

2. **Verify IntlProvider Setup:**
   - Read `/src/app/layout.tsx`
   - Confirm `NextIntlClientProvider` wraps children

### Implementation Testing

3. **After Code Changes:**
   ```bash
   # Type check
   npx tsc --noEmit

   # Lint check
   npm run lint

   # Start dev server
   npm run dev
   ```

4. **Visual Verification:**
   - Navigate to dashboard
   - Verify LogoutButton displays
   - Click logout button (if visible)
   - Verify text displays correctly

### Hot Reload Testing

5. **Hot Reload Test:**
   - Keep browser open on dashboard
   - Edit `/messages/en.json`
   - Modify `auth.signOut` value
   - Save file
   - Observe browser updates automatically
   - Revert change
   - Confirm revert is reflected

### Build Verification

6. **Production Build Test:**
   ```bash
   npm run build
   ```
   - Build should complete without errors
   - No translation-related warnings

---

## 9. Code Examples

### Before: LogoutButton (Current)

```typescript
'use client';

import { useState } from 'react';
// ... other imports

function ConfirmationModal({ isOpen, onConfirm, onCancel, loading }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
        <div className="flex space-x-3">
          <button onClick={onCancel} disabled={loading} className="...">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="...">
            {loading ? <Loader2 ... /> : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### After: LogoutButton (With Translations)

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
// ... other imports

function ConfirmationModal({ isOpen, onConfirm, onCancel, loading }: ConfirmationModalProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('confirmLogout')}</h3>
        <p className="text-gray-600 mb-6">{t('confirmSignOutMessage')}</p>
        <div className="flex space-x-3">
          <button onClick={onCancel} disabled={loading} className="...">
            {tCommon('cancel')}
          </button>
          <button onClick={onConfirm} disabled={loading} className="...">
            {loading ? <Loader2 ... /> : t('signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LogoutButton({
  variant = 'button',
  size = 'md',
  showConfirmation = false,
  onLogoutStart,
  onLogoutComplete,
  className = '',
}: LogoutButtonProps) {
  const t = useTranslations('auth');

  const { signOut, user } = useAuth();
  // ... rest of component with t('signOut') calls
```

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| IntlProvider not configured | Low | High | Check prerequisite tasks are complete |
| Missing translation keys | Medium | Low | Add keys before modifying component |
| Hook rules violation | Low | Medium | Ensure hooks at top of function body |
| TypeScript type errors | Low | Low | Use correct `useTranslations` import |
| Hot reload not working | Medium | Low | May need server restart; document if occurs |
| Production build fails | Low | Medium | Run build check after implementation |
| Component breaks during testing | Low | Medium | Keep original code available for rollback |

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Task 2.6.1: Add translation keys to en.json | 5 min |
| Task 2.6.2: Update LogoutButton component | 15 min |
| Task 2.6.3: Update other locale files | 10 min |
| Task 2.6.4: Hot reload verification | 10 min |
| Task 2.6.5: Document results | 5 min |
| Build verification | 5 min |
| **Total** | **~50 min** |

---

## 12. Rollback Plan

If issues are encountered:

1. **Revert LogoutButton changes:**
   ```bash
   git checkout -- src/components/LogoutButton.tsx
   ```

2. **Revert translation file changes:**
   ```bash
   git checkout -- messages/
   ```

3. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   ```

4. **Restart development server:**
   ```bash
   npm run dev
   ```

---

## 13. Next Steps After Implementation

After completing Task 2.6 (this task):

1. **Phase 2 Complete:** All i18n framework integration tasks are done
2. **Phase 3 Ready:** Translation service implementation can begin
3. **Pattern Established:** Future component translations follow this pattern
4. **Phase 5 Ready:** Language switching infrastructure can be implemented

### Components Ready for Future Translation

Based on patterns from this task, these components are next candidates:
- `/src/components/LoginForm.tsx`
- `/src/components/ConfirmationModal.tsx`
- `/src/components/ItemManager/` components
- Dashboard layout navigation items

---

## References

- [next-intl useTranslations Hook](https://next-intl-docs.vercel.app/docs/usage/messages)
- [next-intl Client Components](https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#client-components)
- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Task 2.1: Install next-intl](/docs/REQ-229-install-and-configure-next-intl-overview.md)

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Phase 2, Task 2.6*
