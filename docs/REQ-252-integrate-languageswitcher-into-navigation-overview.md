# Implementation Breakdown: REQ-252 - Integrate LanguageSwitcher into Navigation

**Generated:** 2026-01-18 20:30:00 UTC
**Last Modified:** 2026-01-18 20:30:00 UTC
**Request Reference:** REQ-252 - Integrate Language Switcher into Application Navigation
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 5, Task 5.7)
**Epic:** L10N Epic 1 - Foundation
**Size:** S (Small)

---

## Overview

This document provides a detailed implementation breakdown for integrating the LanguageSwitcher component into the application's navigation areas. The component will be added to the DashboardLayout header for authenticated users and optionally to public-facing pages. This task assumes the LanguageSwitcher component has already been created (Task 5.3) and focuses solely on the integration into existing layout components.

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Header layout structure | `/src/components/DashboardLayout.tsx:229-295` | Target location for LanguageSwitcher integration in dashboard |
| Right-side header items | `/src/components/DashboardLayout.tsx:274-292` | AccountSelector and Logout button placement pattern |
| Admin layout header | `/src/app/admin/layout.tsx:224-252` | Alternative header pattern for admin pages |
| Public page header | `/src/app/page.tsx:78-114` | Header structure for public-facing landing page |
| Responsive flex layout | `/src/components/DashboardLayout.tsx:231` | `flex justify-between items-center` pattern |
| Component spacing | `/src/components/DashboardLayout.tsx:275` | `space-x-3` for consistent item spacing |

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| `LanguageSwitcher` component | Component | Must be created first (Task 5.3) |
| `useLanguagePreference` hook | Custom Hook | Should be created (Task 5.4) |
| Language preference API | API Route | Should be created (Task 5.6) |
| `preferred_language` DB column | Database | Must exist (Phase 1, Task 1.3) |
| `next-intl` | NPM Package | Must be installed (Phase 2) |

### Integration Points

| Component | Integration Type | Notes |
|-----------|------------------|-------|
| `DashboardLayout` | Required | Primary integration point for authenticated dashboard users |
| Admin layout | Recommended | Secondary integration for admin section |
| Public page header | Optional | Can be added in Epic 4 (Guest Experience) |
| `RoleBasedNavigation` | Not recommended | LanguageSwitcher belongs in header, not navigation bar |

---

## Requirements

### Functional Requirements

From REQ-252:
1. Language switcher appears in the dashboard layout header for authenticated users
2. Language switcher maintains its position and styling consistently across dashboard pages
3. Language selection persists when navigating between different sections of the dashboard
4. Public-facing pages optionally display the language switcher in their navigation
5. The switcher remains functional and visible on both desktop and mobile viewports

### Acceptance Criteria

- [ ] Language switcher appears in the dashboard layout header for authenticated users
- [ ] Language switcher maintains its position and styling consistently across dashboard pages
- [ ] Language selection persists when navigating between different sections of the dashboard
- [ ] Public-facing pages optionally display the language switcher in their navigation
- [ ] The switcher remains functional and visible on both desktop and mobile viewports

---

## Architecture

### Integration Locations

```
/src/components/DashboardLayout.tsx
└── Header (lines 229-295)
    └── Right side container (lines 274-292)
        ├── [NEW] LanguageSwitcher          ← Add here
        ├── CompactAccountSelector
        └── Logout button

/src/app/admin/layout.tsx (optional)
└── Header (lines 224-252)
    └── Right side container (lines 243-250)
        ├── [NEW] LanguageSwitcher          ← Add here
        └── Logout button

/src/app/page.tsx (optional - for Epic 4)
└── Header (lines 78-114)
    └── Right side (lines 106-111)
        ├── [NEW] LanguageSwitcher          ← Add here
        └── Log In link
```

### Visual Placement

**Desktop View (DashboardLayout):**
```
┌─────────────────────────────────────────────────────────────────────┐
│ FAQBNB Dashboard  [Section Badge]                                   │
│ [Role] [Email]                                                      │
│                                         [Lang ▼] [Account ▼] [Logout]│
└─────────────────────────────────────────────────────────────────────┘
│ Dashboard │ Items │ Guides │ Properties │ Analytics │               │
└─────────────────────────────────────────────────────────────────────┘
```

**Mobile View:**
```
┌─────────────────────────────────┐
│ FAQBNB Dashboard        ☰      │
│ [Role] [Email]                 │
│              [Lang ▼] [Logout] │
└─────────────────────────────────┘
```

### Data Flow

```
LanguageSwitcher in DashboardLayout
         │
         ▼
User selects language
         │
         ├── Updates cookie (FAQBNB_LANG)
         │      └── Immediate persistence
         │
         ├── If authenticated → API call to /api/user/language
         │      └── Saves to users.preferred_language
         │
         └── next-intl locale change
                └── UI re-renders with new translations
         │
         ▼
Navigation between dashboard sections
         │
         └── Language persists via cookie/DB preference
```

---

## Authorized Files and Functions for Modification

### Existing Files to Modify

| File Path | Lines | Modification |
|-----------|-------|--------------|
| `/src/components/DashboardLayout.tsx` | 1-10, 274-292 | Add LanguageSwitcher import and integration in header |
| `/src/app/admin/layout.tsx` | 1-10, 243-250 | (Optional) Add LanguageSwitcher to admin header |
| `/src/app/page.tsx` | 1-10, 106-111 | (Optional - Epic 4) Add LanguageSwitcher to public header |

### New Files to Create

None - this task focuses on integration only.

### Files for Reference Only (Do Not Modify)

| File Path | Purpose |
|-----------|---------|
| `/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Component to be imported |
| `/src/components/LanguageSwitcher/index.ts` | Barrel export for clean imports |
| `/src/components/AccountSelector.tsx` | Reference for header component placement |
| `/src/components/RoleBasedNavigation.tsx` | Reference for navigation structure (not for LanguageSwitcher) |
| `/src/contexts/AuthContext.tsx` | Reference for user state access |

---

## Implementation Tasks

### Task 1: Integrate LanguageSwitcher into DashboardLayout Header

**File:** `/src/components/DashboardLayout.tsx`

**Step 1.1: Add Import**

Location: Near line 8 (after other component imports)

```typescript
// Before
import { CompactAccountSelector } from './AccountSelector';
import { RoleBasedNavigation } from './RoleBasedNavigation';

// After
import { CompactAccountSelector } from './AccountSelector';
import { RoleBasedNavigation } from './RoleBasedNavigation';
import { LanguageSwitcher } from './LanguageSwitcher';
```

**Step 1.2: Add LanguageSwitcher to Header Right Side**

Location: Lines 274-292 (within the right side `<div>`)

```typescript
// Before (lines 274-292)
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

// After
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

**Acceptance Criteria:**
- [ ] LanguageSwitcher import is added at top of file
- [ ] LanguageSwitcher appears before AccountSelector in header
- [ ] Uses compact variant and small size for header fit
- [ ] Maintains consistent spacing with other header elements

---

### Task 2: (Optional) Integrate into Admin Layout Header

**File:** `/src/app/admin/layout.tsx`

**Note:** This is an optional integration for the legacy admin layout. The DashboardLayout integration (Task 1) covers the main dashboard experience.

**Step 2.1: Add Import**

Location: Near line 6 (after other imports)

```typescript
// Add import
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
```

**Step 2.2: Add LanguageSwitcher to Admin Header**

Location: Lines 243-250 (before Logout button)

```typescript
// Before (lines 243-250)
{/* Right side - Logout */}
<button
  onClick={() => signOut()}
  className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 whitespace-nowrap"
>
  Logout
</button>

// After
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

**Acceptance Criteria:**
- [ ] LanguageSwitcher appears in admin header
- [ ] Consistent styling with DashboardLayout integration
- [ ] Does not break existing admin layout functionality

---

### Task 3: (Optional) Integrate into Public Page Header - Epic 4 Scope

**File:** `/src/app/page.tsx`

**Note:** This integration is recommended for Epic 4 (Guest Experience) but can be done as part of this task if desired.

**Step 3.1: Add Import**

Location: Near line 3 (after other imports)

```typescript
// Add import
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
```

**Step 3.2: Add LanguageSwitcher to Public Header**

Location: Lines 106-111 (before Log In link)

```typescript
// Before (lines 106-111)
<Link
  href="/login"
  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
>
  Log In
</Link>

// After
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

**Acceptance Criteria:**
- [ ] LanguageSwitcher appears in public page header
- [ ] Works for unauthenticated users (cookie-only persistence)
- [ ] Consistent styling with navigation elements
- [ ] Mobile responsive

---

### Task 4: Verify Responsive Behavior

**File:** `/src/components/DashboardLayout.tsx`

**Verification Steps:**

1. **Desktop (>768px):**
   - LanguageSwitcher visible in header right side
   - Full dropdown functionality
   - Adequate spacing between elements

2. **Tablet (768px-1024px):**
   - LanguageSwitcher still visible
   - May need to verify spacing is appropriate

3. **Mobile (<768px):**
   - LanguageSwitcher should remain visible in header
   - Dropdown should not overflow viewport
   - Consider adding `print:hidden` class if not already present on header

**Implementation (if responsive adjustments needed):**

```typescript
{/* Language Switcher - hidden on smallest screens if space constrained */}
<div className="hidden sm:block">
  <LanguageSwitcher
    variant="compact"
    size="sm"
    className="min-w-[100px]"
  />
</div>
```

**Acceptance Criteria:**
- [ ] LanguageSwitcher displays correctly on desktop (>1024px)
- [ ] LanguageSwitcher displays correctly on tablet (768px-1024px)
- [ ] LanguageSwitcher displays correctly or gracefully hidden on mobile (<768px)
- [ ] Dropdown positioning works on all viewport sizes

---

### Task 5: Test Language Persistence Across Navigation

**Manual Testing Steps:**

1. Log in to dashboard
2. Navigate to Dashboard section
3. Change language using LanguageSwitcher
4. Verify UI updates to selected language
5. Navigate to Items section
6. Verify language persists
7. Navigate to Properties section
8. Verify language persists
9. Refresh page
10. Verify language persists after refresh
11. Log out and log back in
12. Verify language preference is restored from database

**Acceptance Criteria:**
- [ ] Language persists across dashboard section navigation
- [ ] Language persists across page refreshes
- [ ] Language persists across logout/login for authenticated users
- [ ] No console errors during language changes

---

## Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| LanguageSwitcher component not found | Build error - ensure Task 5.3 is complete first |
| API endpoint not available | Component should fallback to cookie-only persistence |
| Cookie blocked by browser | Language works for current session only |
| next-intl not configured | Component renders but language change may not take full effect |

---

## Testing Considerations

### Unit Tests

Not required for this task - testing is done at component level (Task 5.3).

### Integration Tests

- [ ] LanguageSwitcher renders in DashboardLayout header
- [ ] LanguageSwitcher is accessible via keyboard in header context
- [ ] Language change updates all visible UI text

### Manual Testing Checklist

1. **Desktop:**
   - [ ] LanguageSwitcher visible in header
   - [ ] Dropdown opens on click
   - [ ] All 6 languages listed
   - [ ] Selection changes language
   - [ ] Dropdown closes after selection

2. **Mobile:**
   - [ ] LanguageSwitcher visible (or gracefully hidden if space-constrained)
   - [ ] Dropdown doesn't overflow screen
   - [ ] Touch targets adequate size

3. **Navigation:**
   - [ ] Language persists to Dashboard
   - [ ] Language persists to Items
   - [ ] Language persists to Guides
   - [ ] Language persists to Properties
   - [ ] Language persists to Analytics

---

## Dependencies on Other Tasks

| Task | Dependency Type | Notes |
|------|-----------------|-------|
| Task 5.3 (LanguageSwitcher component) | **Required** | Component must exist before integration |
| Task 5.4 (useLanguagePreference hook) | Recommended | Hook may be used by component internally |
| Task 5.6 (Language preference API) | Required | API needed for database persistence |
| Task 1.3 (preferred_language column) | Required | Database column must exist |
| Task 2.1-2.6 (next-intl setup) | Required | i18n framework must be configured for language change to work |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: DashboardLayout integration | 30 minutes |
| Task 2: Admin layout integration (optional) | 20 minutes |
| Task 3: Public page integration (optional) | 20 minutes |
| Task 4: Responsive verification | 20 minutes |
| Task 5: Navigation persistence testing | 30 minutes |
| **Total (required only)** | **~1 hour** |
| **Total (with optional)** | **~2 hours** |

---

## Implementation Order

1. **Prerequisites:** Verify Task 5.3 (LanguageSwitcher component) is complete
2. **Required:** Complete Task 1 (DashboardLayout integration)
3. **Optional:** Complete Task 2 (Admin layout integration)
4. **Optional:** Complete Task 3 (Public page integration) - can defer to Epic 4
5. **Verify:** Complete Tasks 4-5 (responsive behavior and persistence testing)

---

## Notes

1. **Component Availability:** This task assumes the LanguageSwitcher component (`/src/components/LanguageSwitcher/`) has been created in Task 5.3. If not, complete that task first.

2. **Import Path:** The LanguageSwitcher should be imported from `'./LanguageSwitcher'` in DashboardLayout.tsx since they're in the same directory level, or `'@/components/LanguageSwitcher'` in other files.

3. **Mobile Considerations:** The DashboardLayout header has limited space on mobile. The `min-w-[100px]` class ensures the component has enough width, but on very small screens, consider hiding it or using a more compact display.

4. **Print Styles:** The header section already has `print:hidden` class, so the LanguageSwitcher will be hidden in print mode automatically.

5. **Public Pages:** The public page integration (Task 3) is marked as optional for this epic. Epic 4 (Guest Experience) will fully address guest language selection, which may include additional UI considerations.

---

## References

- Implementation Plan: `/docs/prd/Plan-110-L10N-Epic1-Foundation.md`
- LanguageSwitcher Component: `/docs/REQ-248-create-languageswitcher-component-overview.md`
- DashboardLayout: `/src/components/DashboardLayout.tsx`
- Admin Layout: `/src/app/admin/layout.tsx`
- Public Page: `/src/app/page.tsx`
- PRD: `/docs/prd/PRD_L10N_Epic1_Foundation.md`

---

*Document generated for FAQBNB Localization Epic 1 - Foundation, Task 5.7*
