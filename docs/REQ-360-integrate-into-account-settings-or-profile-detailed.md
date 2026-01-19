# REQ-360: Integrate Language Preference Section into Account Settings - Detailed Task Breakdown

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Reference:** REQ-360 (Epic 5 - Owner Translation Management)
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.3
**Overview Document:** `/docs/REQ-360-integrate-into-account-settings-or-profile-overview.md`
**Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## Executive Summary

This document provides granular, actionable implementation tasks for REQ-360: Integrate Language Preference Section into Account Settings. The task involves creating a new Account Settings page at `/dashboard2/settings`, adding a Settings navigation item to the dashboard navigation, and integrating the `LanguagePreferenceSection` component (created in REQ-358) into this new page. Property owners will be able to navigate to Settings to view and modify their interface language preference.

**Estimated Story Points:** 2-3 (S-M sized task)
**Dependencies:** REQ-358 (LanguagePreferenceSection component), Epic 1 Foundation (user language API)

---

## Pre-Implementation Checklist

Before starting implementation, verify the following dependencies exist:

| Dependency | File Location | Status | Notes |
|------------|---------------|--------|-------|
| `LanguagePreferenceSection` component | `/src/components/TranslationManagement/LanguagePreference/` | Required | REQ-358 |
| `TranslationManagement` barrel export | `/src/components/TranslationManagement/index.ts` | Required | REQ-358 |
| `useAuth` hook | `/src/contexts/AuthContext.tsx` | Exists | Provides user authentication state |
| `/api/user/language` endpoint | `/src/app/api/user/language/route.ts` | Exists | REQ-251, used by LanguagePreferenceSection |
| Dashboard layout | `/src/app/dashboard2/layout.tsx` | Exists | Navigation integration target |
| `SupportedLanguage` type | `/src/components/LanguageSwitcher/constants.ts` | Exists | Type definitions |

**Blocking Dependencies:**
- REQ-358 must be complete (LanguagePreferenceSection component created)
- REQ-359 is partial dependency (account-level API exists as alternative via user-level API)

---

## Placement Decision Documentation

### Analysis Summary

Based on the existing application information architecture analysis:

| Location Option | Recommendation | Rationale |
|-----------------|----------------|-----------|
| **New Account Settings Page** (`/dashboard2/settings`) | **Selected** | Clean separation, dedicated settings space, follows common SaaS patterns |
| Properties Page | Not recommended | Logically unrelated to properties |
| Dashboard Home | Not recommended | Clutters main dashboard, not settings context |
| DashboardSettingsPopover | Not recommended | Limited space, different purpose (UI toggles) |

**Final Decision:** Create a new Account Settings page at `/dashboard2/settings`

This approach:
1. Provides a dedicated space for user preferences
2. Follows established SaaS application patterns
3. Creates a foundation for future settings sections
4. Maintains consistent navigation patterns with existing dashboard pages

---

## Task Breakdown

### Task 6.3.1: Create Settings Page Directory

**Priority:** 1 (Must complete first)
**Estimated Effort:** ~2 minutes
**Story Points:** 0.25
**Depends On:** None

**Objective:** Create the settings page directory structure.

**Action Steps:**

1. Create the directory `/src/app/dashboard2/settings/`

**Shell Command:**
```bash
mkdir -p src/app/dashboard2/settings
```

**Verification:**
- [ ] Directory exists: `/src/app/dashboard2/settings/`

**Notes:**
- This directory follows Next.js App Router conventions
- The `page.tsx` file inside will be accessible at `/dashboard2/settings`

---

### Task 6.3.2: Create Account Settings Page

**Priority:** 2 (Core implementation)
**Estimated Effort:** 20-30 minutes
**Story Points:** 2
**Depends On:** Task 6.3.1, REQ-358 (LanguagePreferenceSection)

**Objective:** Create the Account Settings page that integrates the LanguagePreferenceSection component.

**File to Create:** `/src/app/dashboard2/settings/page.tsx`

#### 6.3.2.1: Complete Implementation

```typescript
// /src/app/dashboard2/settings/page.tsx
// REQ-360: Account Settings Page - Language Preference Integration
// Phase: 6 - Language Preference Setting
// Task ID: 6.3
// Created: 2026-01-19
// Last Modified: 2026-01-19

'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Loader2, CheckCircle } from 'lucide-react';
import { LanguagePreferenceSection } from '@/components/TranslationManagement';
import type { SupportedLanguage } from '@/components/LanguageSwitcher/constants';

/**
 * AccountSettingsPage - Main settings page for property owner preferences
 *
 * Features:
 * - Language preference section with LanguagePreferenceSection component
 * - Success message feedback with auto-dismiss
 * - Loading and authentication states handled
 * - Responsive design matching dashboard patterns
 *
 * @see REQ-360 for acceptance criteria
 * @see REQ-358 for LanguagePreferenceSection component
 */
export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handler for successful language save
  const handleLanguageSave = useCallback((language: SupportedLanguage) => {
    // Get language display name for user feedback
    const languageNames: Record<SupportedLanguage, string> = {
      en: 'English',
      fr: 'French',
      es: 'Spanish',
      de: 'German',
      nl: 'Dutch',
      it: 'Italian',
    };
    const languageName = languageNames[language] || language.toUpperCase();
    setSuccessMessage(`Language preference updated to ${languageName}`);

    // Auto-dismiss after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  // Handler for save errors (logged for debugging, component handles display)
  const handleSaveError = useCallback((error: string) => {
    console.error('Settings save error:', error);
  }, []);

  // Loading state - show spinner while auth is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2
            className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4"
            aria-hidden="true"
          />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Authentication check - prompt login if not authenticated
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings
            className="h-6 w-6 text-[#FF385C]"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Account Settings
          </h1>
        </div>
        <p className="text-gray-600 mt-1">
          Manage your account preferences and application settings
        </p>
      </div>

      {/* Success Message Banner */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#00A699] text-white px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <CheckCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Language Preference Section */}
      <section
        className="bg-white rounded-xl shadow-sm border border-gray-200"
        aria-labelledby="language-preference-heading"
      >
        <LanguagePreferenceSection
          onSave={handleLanguageSave}
          onError={handleSaveError}
          showHeader={true}
        />
      </section>

      {/* Placeholder for future settings sections */}
      {/*
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-[#222222]">Notification Preferences</h3>
        <p className="text-sm text-[#717171]">Coming soon...</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-[#222222]">Privacy Settings</h3>
        <p className="text-sm text-[#717171]">Coming soon...</p>
      </section>
      */}
    </div>
  );
}
```

**Key Implementation Notes:**

1. **Client Component**: Uses `'use client'` directive for interactive features
2. **Auth Integration**: Uses `useAuth` hook from existing AuthContext
3. **Component Integration**: Imports `LanguagePreferenceSection` from TranslationManagement barrel
4. **Success Feedback**: Page-level success banner for additional visual feedback (component also has internal feedback)
5. **Styling**: Follows Airbnb design language with teal success color (#00A699) and rounded-xl cards
6. **Accessibility**: ARIA attributes for status messages and section landmarks

**Verification:**
- [ ] File created at `/src/app/dashboard2/settings/page.tsx`
- [ ] No TypeScript compilation errors
- [ ] Page loads at `/dashboard2/settings` when navigating directly
- [ ] Loading spinner appears while auth is initializing
- [ ] Login prompt appears for unauthenticated users
- [ ] LanguagePreferenceSection renders correctly
- [ ] Success message appears and auto-dismisses after save
- [ ] Page styling matches dashboard design patterns

---

### Task 6.3.3: Update Dashboard Layout Navigation

**Priority:** 3
**Estimated Effort:** 10-15 minutes
**Story Points:** 0.5
**Depends On:** Task 6.3.2

**Objective:** Add Settings navigation item to the dashboard navigation bar.

**File to Modify:** `/src/app/dashboard2/layout.tsx`

#### 6.3.3.1: Add Settings Icon Import

**Location:** Line 20 (existing icon imports)

**Current Code:**
```typescript
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package } from 'lucide-react';
```

**Modified Code:**
```typescript
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package, Settings } from 'lucide-react';
```

#### 6.3.3.2: Add Settings Navigation Item

**Location:** Lines 42-67 (navigationItems array)

**Current Code:**
```typescript
const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package,
  },
  {
    name: 'Guides',
    mobileLabel: 'Guide',
    href: '/dashboard2/instructions',
    icon: FileText,
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2,
  },
];
```

**Modified Code:**
```typescript
// Navigation items for the dashboard
// REQ-205: Updated navigation structure per FAQBNB Review ITEM-04
// REQ-360: Added Settings navigation item
// Order: Dashboard -> Items -> Instructions -> Properties -> Settings
const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    mobileLabel: 'D/B',
    href: '/dashboard2',
    icon: LayoutDashboard,
  },
  {
    name: 'Items',
    mobileLabel: 'Items',
    href: '/dashboard2/items',
    icon: Package,
  },
  {
    name: 'Guides',
    mobileLabel: 'Guide',
    href: '/dashboard2/instructions',
    icon: FileText,
  },
  {
    name: 'Properties',
    mobileLabel: 'Prop.',
    href: '/dashboard2/properties',
    icon: Building2,
  },
  // REQ-360: Settings navigation item for account preferences
  {
    name: 'Settings',
    mobileLabel: 'Set.',
    href: '/dashboard2/settings',
    icon: Settings,
  },
];
```

**Verification:**
- [ ] Settings icon imported from lucide-react
- [ ] Settings item added to navigationItems array
- [ ] Settings appears as the last navigation item
- [ ] No TypeScript compilation errors
- [ ] Navigation renders correctly on desktop (full "Settings" label)
- [ ] Navigation renders correctly on mobile (abbreviated "Set." label)
- [ ] Active state styling works when on Settings page
- [ ] Clicking Settings navigates to `/dashboard2/settings`

---

### Task 6.3.4: Verify TranslationManagement Barrel Export

**Priority:** 4
**Estimated Effort:** 5 minutes
**Story Points:** 0.25
**Depends On:** REQ-358

**Objective:** Verify that the TranslationManagement barrel export correctly exports LanguagePreferenceSection.

**File to Check:** `/src/components/TranslationManagement/index.ts`

**Expected Content (from REQ-358):**
```typescript
// /src/components/TranslationManagement/index.ts
// REQ-358: TranslationManagement module barrel exports
// Created: 2026-01-19
// Last Modified: 2026-01-19

// LanguagePreference exports (REQ-358)
export * from './LanguagePreference';

// Future Epic 5 component exports will be added here:
// export * from './TranslationPreviewPanel';
// export * from './TranslationEditor';
// export * from './TranslationStatusWidget';
// etc.
```

**Action Steps:**

1. Verify file exists at `/src/components/TranslationManagement/index.ts`
2. If file exists, verify it exports from `./LanguagePreference`
3. If file doesn't exist, create it with the above content (should have been created in REQ-358)

**Verification:**
- [ ] File exists at `/src/components/TranslationManagement/index.ts`
- [ ] Export statement includes `export * from './LanguagePreference'`
- [ ] Import works: `import { LanguagePreferenceSection } from '@/components/TranslationManagement'`
- [ ] No circular dependency warnings

---

### Task 6.3.5: Verify Build and Type Checking

**Priority:** 5
**Estimated Effort:** 10 minutes
**Story Points:** 0.5
**Depends On:** Tasks 6.3.1-6.3.4

**Objective:** Ensure all changes build without errors and pass TypeScript checks.

**Action Steps:**

1. Run TypeScript compilation check:
   ```bash
   npx tsc --noEmit
   ```

2. Run the build:
   ```bash
   npm run build
   ```

3. Verify no ESLint errors:
   ```bash
   npm run lint
   ```

4. Start development server and test:
   ```bash
   npm run dev
   ```

**Verification:**
- [ ] `tsc --noEmit` completes with no errors
- [ ] `npm run build` succeeds
- [ ] `npm run lint` shows no errors in modified/new files
- [ ] Development server starts without errors

---

## Complete File Reference

### Files to Create

| Order | File Path | Purpose |
|-------|-----------|---------|
| 1 | `/src/app/dashboard2/settings/page.tsx` | Account Settings page with LanguagePreferenceSection |

### Files to Modify

| File Path | Changes | Lines Affected |
|-----------|---------|----------------|
| `/src/app/dashboard2/layout.tsx` | Add Settings icon import and nav item | Line 20, Lines 42-67 |

### Files to Verify (DO NOT MODIFY unless missing)

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/index.ts` | Verify barrel export exists |
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Component exists from REQ-358 |

### Dependencies Used (READ ONLY)

| File Path | Imported Items |
|-----------|----------------|
| `/src/contexts/AuthContext.tsx` | `useAuth` hook |
| `/src/components/TranslationManagement/` | `LanguagePreferenceSection` component |
| `/src/components/LanguageSwitcher/constants.ts` | `SupportedLanguage` type |
| `lucide-react` | `Settings`, `Loader2`, `CheckCircle` icons |

---

## Acceptance Criteria Verification Matrix

| Criteria | Task | Test Method |
|----------|------|-------------|
| Decision documented regarding placement in account settings vs profile | Pre-task | Documentation review |
| LanguagePreferenceSection imported and rendered on chosen page | 6.3.2 | Code review, visual inspection |
| Component receives current account data via API fetch | 6.3.2 | Network inspection, visual inspection |
| Language dropdown pre-populates with current preference | 6.3.2 | Visual inspection after page load |
| Section appears with clear heading "Interface Language" | 6.3.2 | Visual inspection |
| Component positioned logically within page layout | 6.3.2 | Visual inspection |
| Component styling consistent with page sections | 6.3.2 | Visual inspection |
| Page layout responsive on all viewport sizes | 6.3.2 | Responsive testing |
| Navigation available through existing patterns | 6.3.3 | Click Settings nav item |
| Changes saved immediately reflected on revisit | 6.3.2 | Save, refresh, verify selection |
| Loading state handled while fetching | 6.3.2 | Observe loading spinner |
| Error state handled if data cannot be loaded | 6.3.2 | Simulate API error, verify behavior |

---

## Testing Strategy

### Manual Testing Checklist

**Navigation Testing:**
- [ ] Settings nav item visible on desktop (full "Settings" label)
- [ ] Settings nav item visible on mobile (abbreviated "Set." label)
- [ ] Click Settings navigates to `/dashboard2/settings`
- [ ] Settings nav item shows active state when on settings page
- [ ] Active state removed when navigating away

**Page Load Testing:**
- [ ] Loading spinner appears while auth initializes
- [ ] Page renders correctly after auth completes
- [ ] Login prompt appears for unauthenticated users
- [ ] Direct URL access works: `/dashboard2/settings`

**LanguagePreferenceSection Integration:**
- [ ] Component renders within white rounded card
- [ ] "Interface Language" header visible
- [ ] Current preference pre-selected in dropdown
- [ ] All 6 languages visible in dropdown
- [ ] Flag emojis display correctly
- [ ] Saving preference works
- [ ] Page-level success message appears
- [ ] Success message auto-dismisses after 3 seconds
- [ ] Preference persists after page refresh

**Responsive Testing:**
- [ ] Desktop (1024px+): Full layout, Settings label visible
- [ ] Tablet (768px): Settings label visible, layout adapts
- [ ] Mobile (375px): "Set." label visible, content stacks appropriately

**Accessibility Testing:**
- [ ] Tab navigation reaches Settings nav item
- [ ] Tab navigation reaches all interactive elements on page
- [ ] Screen reader announces page title
- [ ] Screen reader announces success messages
- [ ] Focus visible on all interactive elements

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No saved preference | Default to 'en' (English) |
| API error on preference load | Component shows error state |
| Network timeout | Loading state, then error |
| Save while another save in progress | Button disabled during save |
| Rapid navigation to/from page | No state leaks or errors |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| REQ-358 not complete | Medium | High | Verify component exists before starting; block if not available |
| Import path incorrect | Low | Low | Follow barrel export pattern; verify import compiles |
| Navigation crowding on mobile | Low | Medium | "Set." abbreviation keeps nav compact |
| Active state not working | Low | Low | Existing nav logic handles active state automatically |
| Success message animation not working | Low | Low | Falls back to instant appearance if CSS classes unavailable |

---

## Future Enhancements

This settings page provides a foundation for additional account preferences:

| Future Section | Description | Estimated Priority |
|----------------|-------------|--------------------|
| Notification Preferences | Email/push notification settings | P2 |
| Privacy Settings | Data sharing preferences | P3 |
| Security Settings | Password change, 2FA | P2 |
| Account Deletion | Account removal option | P3 |
| Display Preferences | Theme, density, etc. | P3 |

**Note:** These sections are commented out in the implementation as placeholders for future development.

---

## Implementation Order Summary

| Step | Task | Est. Time | Blocking |
|------|------|-----------|----------|
| 1 | Create settings directory (6.3.1) | 2 min | No |
| 2 | Create settings page (6.3.2) | 20-30 min | Yes (needs REQ-358) |
| 3 | Update navigation (6.3.3) | 10-15 min | No |
| 4 | Verify barrel export (6.3.4) | 5 min | No |
| 5 | Build & test (6.3.5) | 10 min | No |

**Total Estimated Time:** 45-60 minutes

---

## References

- **Overview Document:** `/docs/REQ-360-integrate-into-account-settings-or-profile-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Definition:** `/docs/gen_requests_epic5.md` (REQ-360)
- **Dependency REQ-358:** `/docs/REQ-358-create-languagepreferencesection-component-detailed.md`
- **Dashboard Layout Pattern:** `/src/app/dashboard2/layout.tsx`
- **Page Pattern Reference:** `/src/app/dashboard2/properties/page.tsx`
- **Help Page Reference:** `/src/app/dashboard2/help/page.tsx`

---

*Document generated for FAQBNB Localization Epic 5 - Task 6.3: Integrate into account settings (or profile)*
*Generated: 2026-01-19*
