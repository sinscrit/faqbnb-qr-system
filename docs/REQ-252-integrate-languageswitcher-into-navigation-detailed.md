# Detailed Task Breakdown: REQ-252 - Integrate LanguageSwitcher into Navigation

**Generated:** 2026-01-18 21:15:00 UTC
**Last Modified:** 2026-01-18 21:55:00 UTC
**Request Reference:** REQ-252 - Integrate Language Switcher into Application Navigation
**Overview Document:** REQ-252-integrate-languageswitcher-into-navigation-overview.md
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 5, Task 5.7)
**Epic:** L10N Epic 1 - Foundation
**Size:** S (Small)
**Estimated Story Points:** 2-3

---

## Executive Summary

This document provides granular, actionable tasks for integrating the LanguageSwitcher component into the FAQBNB application's navigation areas. The primary integration point is the DashboardLayout header for authenticated users, with optional integrations for the admin layout and public-facing pages. Each task is scoped to approximately 1 story point for easy implementation by an AI coding agent or junior developer.

---

## Prerequisites

Before starting this implementation, verify the following are complete:

| Prerequisite | Task Reference | Verification Method |
|--------------|----------------|---------------------|
| LanguageSwitcher component exists | Task 5.3 (REQ-248) | Check `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` exists |
| useLanguagePreference hook exists | Task 5.4 (REQ-249) | Check `/src/hooks/useLanguagePreference.ts` exists |
| Language preference API exists | Task 5.6 (REQ-251) | Check `/src/app/api/user/language/route.ts` exists |
| next-intl is configured | Phase 2 | Check `next-intl` in `package.json` and IntlProvider in layout |
| Database column exists | Task 1.3 | Check `users.preferred_language` column exists |

**If any prerequisite is missing, complete the corresponding task first before proceeding.**

---

## Task Breakdown

### Task 1: Add LanguageSwitcher Import to DashboardLayout

**Complexity:** 1 SP
**Priority:** Required
**Dependencies:** LanguageSwitcher component must exist (REQ-248)

#### Objective
Add the import statement for the LanguageSwitcher component to the DashboardLayout file.

#### File to Modify
`/src/components/DashboardLayout.tsx`

#### Implementation Steps

**Step 1.1: Locate the import section**
- Open `/src/components/DashboardLayout.tsx`
- Find the existing component imports (around lines 1-15)
- Look for imports like `CompactAccountSelector` and `RoleBasedNavigation`

**Step 1.2: Add the LanguageSwitcher import**

Find the existing imports (approximately):
```typescript
import { CompactAccountSelector } from './AccountSelector';
import { RoleBasedNavigation } from './RoleBasedNavigation';
```

Add the new import after these:
```typescript
import { LanguageSwitcher } from './LanguageSwitcher';
```

**Alternative import path (if LanguageSwitcher is elsewhere):**
```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
```

#### Verification
- [x] File saves without TypeScript errors
- [x] No red squiggly lines on the import statement
- [x] Build passes: `npm run build` shows no errors

#### Acceptance Criteria
- [x] LanguageSwitcher is imported at the top of DashboardLayout.tsx
- [x] Import path is correct and resolves properly
- [x] No TypeScript compilation errors

---

### Task 2: Integrate LanguageSwitcher into DashboardLayout Header

**Complexity:** 1 SP
**Priority:** Required
**Dependencies:** Task 1 complete

#### Objective
Add the LanguageSwitcher component to the right side of the dashboard header, positioned before the AccountSelector.

#### File to Modify
`/src/components/DashboardLayout.tsx`

#### Implementation Steps

**Step 2.1: Locate the header right side container**
- Navigate to approximately line 274-292
- Find the comment `{/* Right side - Account selector and logout */}`
- This is the `<div className="flex items-center space-x-3">` container

**Step 2.2: Add LanguageSwitcher before AccountSelector**

Current code (lines 274-292):
```typescript
{/* Right side - Account selector and logout */}
<div className="flex items-center space-x-3">
  {/* Account Selector */}
  {showAccountSelector && (
    <CompactAccountSelector
      onAccountChange={handleAccountChange}
      className="w-64"
    />
  )}

  {/* Logout Button */}
  <button
    onClick={() => signOut()}
    className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 whitespace-nowrap"
    title="Sign out of your account"
  >
    Logout
  </button>
</div>
```

Updated code:
```typescript
{/* Right side - Language, Account selector and logout */}
<div className="flex items-center space-x-3">
  {/* Language Switcher */}
  <LanguageSwitcher
    variant="compact"
    size="sm"
    className="min-w-[100px]"
  />

  {/* Account Selector */}
  {showAccountSelector && (
    <CompactAccountSelector
      onAccountChange={handleAccountChange}
      className="w-64"
    />
  )}

  {/* Logout Button */}
  <button
    onClick={() => signOut()}
    className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 whitespace-nowrap"
    title="Sign out of your account"
  >
    Logout
  </button>
</div>
```

#### Component Props Explanation
| Prop | Value | Purpose |
|------|-------|---------|
| `variant` | `"compact"` | Uses smaller, dropdown-style presentation suitable for header |
| `size` | `"sm"` | Small size to match header button proportions |
| `className` | `"min-w-[100px]"` | Ensures minimum width for language display |

#### Verification
- [x] Build passes without errors: `npm run build`
- [x] Start dev server: `npm run dev`
- [x] Navigate to dashboard
- [x] LanguageSwitcher is visible in header to the left of AccountSelector

#### Acceptance Criteria
- [x] LanguageSwitcher renders in dashboard header
- [x] LanguageSwitcher is positioned before AccountSelector
- [x] Component uses compact variant appropriate for header
- [x] Spacing is consistent with other header elements (space-x-3)

---

### Task 3: Verify Component Functionality in Dashboard

**Complexity:** 1 SP
**Priority:** Required
**Dependencies:** Task 2 complete

#### Objective
Manually verify that the LanguageSwitcher functions correctly within the DashboardLayout context.

#### Testing Steps

**Step 3.1: Open dashboard in browser**
- Start dev server: `npm run dev`
- Navigate to `http://localhost:3000/dashboard`
- Log in if required

**Step 3.2: Test dropdown functionality**
- [x] Click on LanguageSwitcher dropdown
- [x] Verify all 6 languages are displayed (English, French, Spanish, German, Dutch, Italian)
- [x] Verify native language names are shown (Deutsch, Français, Español, etc.)

**Step 3.3: Test language selection**
- [x] Select a different language (e.g., French)
- [x] Verify dropdown closes after selection
- [x] Verify the selected language indicator updates
- [x] Check browser console for any errors

**Step 3.4: Test keyboard navigation**
- [x] Tab to the LanguageSwitcher
- [x] Press Enter/Space to open dropdown
- [x] Use arrow keys to navigate options
- [x] Press Enter to select
- [x] Press Escape to close without selecting

#### Acceptance Criteria
- [x] Dropdown opens and closes correctly
- [x] All 6 languages are listed
- [x] Language selection works without errors
- [x] No console errors during interaction
- [x] Keyboard navigation is functional

---

### Task 4: Test Language Persistence Across Dashboard Navigation

**Complexity:** 1 SP
**Priority:** Required
**Dependencies:** Task 3 complete

#### Objective
Verify that the selected language persists when navigating between different sections of the dashboard.

#### Testing Steps

**Step 4.1: Set initial language**
- Navigate to Dashboard section
- Change language to non-English (e.g., French "Français")
- Note the current language indicator

**Step 4.2: Navigate through dashboard sections**
Test navigation to each dashboard section while verifying language persists:

| Section | URL Path | Expected Behavior |
|---------|----------|-------------------|
| Dashboard | `/dashboard` | French remains selected |
| Items | `/items` | French remains selected |
| Guides | `/guides` | French remains selected |
| Properties | `/properties` | French remains selected |
| Analytics | `/analytics` | French remains selected |

**Step 4.3: Test page refresh**
- Press F5 or Ctrl+R to refresh the page
- Verify language preference is maintained after refresh

**Step 4.4: Test logout/login cycle (if API persistence is implemented)**
- Note current language preference
- Log out
- Log back in
- Verify language preference is restored from database

#### Acceptance Criteria
- [x] Language persists across all dashboard section navigation
- [x] Language persists after page refresh
- [x] Language persists after logout/login (for authenticated users)
- [x] Cookie `FAQBNB_LANG` is set correctly (check Developer Tools > Application > Cookies)

---

### Task 5: Verify Responsive Behavior

**Complexity:** 1 SP
**Priority:** Required
**Dependencies:** Task 2 complete

#### Objective
Ensure the LanguageSwitcher displays correctly across different viewport sizes.

#### Testing Steps

**Step 5.1: Desktop testing (>1024px)**
- Open dashboard in full browser window
- [x] LanguageSwitcher is visible and fully functional
- [x] Dropdown does not clip or overflow
- [x] Adequate spacing with adjacent elements

**Step 5.2: Tablet testing (768px-1024px)**
- Resize browser window to tablet width (~900px)
- [x] LanguageSwitcher remains visible
- [x] Layout does not break
- [x] Dropdown positions correctly

**Step 5.3: Mobile testing (<768px)**
- Resize browser window to mobile width (~375px)
- [x] LanguageSwitcher is visible (or gracefully handled)
- [x] Dropdown does not overflow viewport
- [x] Touch targets are adequate size (min 44x44px)

**Step 5.4: Using Developer Tools**
- Open Chrome DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Test the following device presets:
  - iPhone SE (375x667)
  - iPad (768x1024)
  - MacBook Pro (1440x900)

#### Potential Responsive Adjustment
If the LanguageSwitcher causes layout issues on mobile, apply this modification:

```typescript
{/* Language Switcher - visible on sm screens and up */}
<div className="hidden sm:block">
  <LanguageSwitcher
    variant="compact"
    size="sm"
    className="min-w-[100px]"
  />
</div>
```

**Note:** Only apply this if mobile layout is broken. Ideally, the component should remain visible on all screen sizes.

#### Acceptance Criteria
- [x] Desktop layout displays correctly
- [x] Tablet layout displays correctly
- [x] Mobile layout displays correctly or is gracefully hidden
- [x] Dropdown positioning works on all viewport sizes
- [x] No horizontal scroll introduced on any viewport

---

### Task 6: (Optional) Add LanguageSwitcher to Admin Layout

**Complexity:** 1 SP
**Priority:** Optional
**Dependencies:** Task 2 complete (primary integration)

#### Objective
Add LanguageSwitcher to the admin layout header for consistency.

#### File to Modify
`/src/app/admin/layout.tsx`

#### Implementation Steps

**Step 6.1: Add import**
Add at the top of the file with other imports:
```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
```

**Step 6.2: Locate admin header right side**
- Navigate to approximately lines 243-250
- Find the comment `{/* Right side - Logout */}`

**Step 6.3: Wrap Logout button with container and add LanguageSwitcher**

Current code (lines 243-249):
```typescript
{/* Right side - Logout */}
<button
  onClick={() => signOut()}
  className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 whitespace-nowrap"
>
  Logout
</button>
```

Updated code:
```typescript
{/* Right side - Language and Logout */}
<div className="flex items-center space-x-3">
  <LanguageSwitcher
    variant="compact"
    size="sm"
    className="min-w-[100px]"
  />
  <button
    onClick={() => signOut()}
    className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 whitespace-nowrap"
  >
    Logout
  </button>
</div>
```

#### Verification
- [x] Build passes: `npm run build`
- [x] Navigate to `/admin` in browser
- [x] LanguageSwitcher appears in admin header
- [x] Logout button still functions correctly

#### Acceptance Criteria
- [x] LanguageSwitcher appears in admin header
- [x] Styling is consistent with DashboardLayout integration
- [x] Admin layout functionality is not broken

---

### Task 7: (Optional - Epic 4 Scope) Add LanguageSwitcher to Public Page

**Complexity:** 1 SP
**Priority:** Optional (defer to Epic 4)
**Dependencies:** Task 2 complete

#### Objective
Add LanguageSwitcher to the public landing page header for unauthenticated visitors.

**Note:** This task is recommended for Epic 4 (Guest Experience) but can be completed here if desired.

#### File to Modify
`/src/app/page.tsx`

#### Implementation Steps

**Step 7.1: Add import**
Add at the top of the file:
```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
```

**Step 7.2: Locate public header right side**
- Navigate to approximately lines 106-111
- Find the Log In link

**Step 7.3: Wrap Log In link with container and add LanguageSwitcher**

Current code (lines 106-111):
```typescript
<Link
    href="/login"
    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
>
    Log In
</Link>
```

Updated code:
```typescript
<div className="flex items-center space-x-4">
  <LanguageSwitcher
    variant="compact"
    size="sm"
    className="min-w-[100px]"
  />
  <Link
    href="/login"
    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
  >
    Log In
  </Link>
</div>
```

#### Verification
- [x] Build passes: `npm run build`
- [x] Navigate to `/` (landing page) in browser
- [x] LanguageSwitcher appears in public header
- [x] Works without authentication (cookie-only persistence)

#### Acceptance Criteria
- [x] LanguageSwitcher appears in public page header
- [x] Works for unauthenticated users
- [x] Cookie persistence works without user account
- [x] Mobile responsive

---

## Summary Checklist

### Required Tasks
- [x] **Task 1:** Add LanguageSwitcher import to DashboardLayout
- [x] **Task 2:** Integrate LanguageSwitcher into DashboardLayout header
- [x] **Task 3:** Verify component functionality in dashboard
- [x] **Task 4:** Test language persistence across dashboard navigation
- [x] **Task 5:** Verify responsive behavior

### Optional Tasks
- [x] **Task 6:** Add LanguageSwitcher to admin layout (optional)
- [x] **Task 7:** Add LanguageSwitcher to public page (optional - Epic 4)

---

## Error Handling Reference

| Error | Cause | Resolution |
|-------|-------|------------|
| `Module not found: LanguageSwitcher` | Component not created yet | Complete REQ-248 first |
| `LanguageSwitcher is not exported` | Missing barrel export | Check `/src/components/LanguageSwitcher/index.ts` exists with proper export |
| TypeScript prop errors | Component props mismatch | Check LanguageSwitcher.types.ts for correct prop names |
| Dropdown clips at viewport edge | CSS positioning issue | Ensure dropdown has `position: relative` parent |
| Language doesn't persist | API or cookie issue | Verify REQ-251 (API) is complete and cookie is being set |

---

## Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| `/src/components/DashboardLayout.tsx` | Modify | Add import (line ~8), add component (lines 274-292) |
| `/src/app/admin/layout.tsx` | Modify (Optional) | Add import, wrap logout with flex container |
| `/src/app/page.tsx` | Modify (Optional) | Add import, wrap login link with flex container |

---

## Testing Commands

```bash
# Build verification
npm run build

# Development server
npm run dev

# Type checking
npx tsc --noEmit

# Lint check
npm run lint
```

---

## Definition of Done

- [x] LanguageSwitcher component is integrated into DashboardLayout header
- [x] Component is visible and functional for all authenticated users
- [x] Language selection persists across dashboard navigation
- [x] Language selection persists after page refresh
- [x] Responsive design works on desktop, tablet, and mobile
- [x] Build passes without errors
- [x] No TypeScript compilation errors
- [x] No console errors during normal usage
- [x] Code follows existing patterns in DashboardLayout
- [x] (Optional) Admin layout integration complete
- [x] (Optional) Public page integration complete

---

## References

- Overview Document: `docs/REQ-252-integrate-languageswitcher-into-navigation-overview.md`
- Implementation Plan: `docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- LanguageSwitcher Component: `docs/REQ-248-create-languageswitcher-component-overview.md`
- DashboardLayout: `src/components/DashboardLayout.tsx`
- Admin Layout: `src/app/admin/layout.tsx`
- Public Page: `src/app/page.tsx`

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Task 5.7*
