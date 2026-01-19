# REQ-360: Integrate Language Preference Section into Account Settings - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Reference:** REQ-360 (Epic 5 - Owner Translation Management)
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.3
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## 1. Summary

This document provides the implementation breakdown for integrating the `LanguagePreferenceSection` component (created in REQ-358) into the application's user interface. Property owners need a discoverable location to access and modify their language preference settings. The task involves determining the optimal placement (account settings vs. profile page), adding the component to the chosen location, and ensuring the current preference is pre-populated from account data.

**Key Deliverables:**
- Determine placement location based on existing application information architecture
- Create or modify the appropriate settings/profile page to include LanguagePreferenceSection
- Ensure component receives current account preference data
- Maintain responsive design and consistent styling

---

## 2. Dependencies

### 2.1 Epic Dependencies

| Epic | Dependency | Status | Notes |
|------|------------|--------|-------|
| Epic 1 (Foundation) | `preferred_language` columns in `users` table | **Complete** | REQ-225 |
| Epic 1 (Foundation) | Language preference API (`/api/user/language`) | **Complete** | REQ-251 |
| Epic 1 (Foundation) | useLanguagePreference hook | **Complete** | REQ-249 |
| Epic 5 (Phase 6.1) | LanguagePreferenceSection component | **Required** | REQ-358 |
| Epic 5 (Phase 6.2) | Account preference API endpoint | **Required** | REQ-359 |

### 2.2 Direct Task Dependencies

| Dependency | Description | Blocking |
|------------|-------------|----------|
| REQ-358 | LanguagePreferenceSection component must exist | Yes |
| REQ-359 | Account preference API endpoint should exist for account-level updates | Partial - user-level API exists |

### 2.3 Codebase Dependencies

| Dependency | Location | Purpose |
|------------|----------|---------|
| AuthContext | `/src/contexts/AuthContext.tsx` | Get current user/account data |
| useAuth hook | `/src/contexts/AuthContext.tsx` | Access authentication state |
| LanguagePreferenceSection | `/src/components/TranslationManagement/LanguagePreference/` | Component to integrate |
| Dashboard2 Layout | `/src/app/dashboard2/layout.tsx` | Navigation structure reference |

---

## 3. Technical Context

### 3.1 Current Application Architecture Analysis

Based on codebase investigation, the dashboard structure is:

```
/dashboard2
├── page.tsx                    # Main dashboard home
├── layout.tsx                  # Layout with header, nav, PropertyProvider
├── items/                      # Item management
├── instructions/               # Article/Guide management
├── properties/                 # Property management ← Similar settings pattern
├── help/                       # Help & User Guide
├── create/                     # Item creation wizard
├── print/                      # QR code printing
├── rooms/                      # Room management
└── tags/                       # Tag management
```

**Key Observation:** There is currently **no dedicated account settings page** in the dashboard. The navigation structure includes:
- Dashboard, Items, Guides, Properties

### 3.2 Placement Decision Analysis

| Location Option | Pros | Cons | Recommendation |
|----------------|------|------|----------------|
| **New Account Settings Page** (`/dashboard2/settings`) | Clean separation; Dedicated space for preferences; Follows common patterns | Requires new nav item; Additional development | **Recommended** |
| **Properties Page** | Existing page; Quick integration | Not logically related to properties | Not recommended |
| **Dashboard Home Page** | Highly visible | Clutters main dashboard; Not a settings context | Not recommended |
| **DashboardSettingsPopover** | Already exists for dashboard preferences | Limited space; Different purpose (UI toggles) | Partial option |

### 3.3 Recommended Approach

**Create a new Account Settings page** at `/dashboard2/settings` that will:
1. House the LanguagePreferenceSection component
2. Provide a foundation for future account-level settings
3. Follow the same page patterns as Properties page (`/dashboard2/properties/page.tsx`)

**Navigation Integration:**
- Add "Settings" to the navigation in `layout.tsx`
- Use `Settings` icon from lucide-react (already imported in help page)
- Position as the last navigation item

### 3.4 Existing Stack Reference

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x with Airbnb Design Language |
| **Icons** | Lucide React |
| **State Management** | React Context (AuthContext, PropertyContext) |

### 3.5 Page Pattern Reference (from `/dashboard2/properties/page.tsx`)

```typescript
// Standard page structure pattern
export default function PageName() {
  const { user, loading } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Loading state handling
  if (!user) { return <LoginPrompt />; }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Page Title</h1>
        <p className="text-gray-600 mt-1">Page description</p>
      </div>

      {/* Success Message Banner */}
      {successMessage && <SuccessBanner message={successMessage} />}

      {/* Main Content Sections */}
      <SectionComponent />
    </div>
  );
}
```

---

## 4. Architecture

### 4.1 File Structure

```
/src/app/dashboard2/
├── layout.tsx                    # MODIFY - Add Settings nav item
└── settings/
    └── page.tsx                  # CREATE - Account settings page

/src/components/TranslationManagement/
└── LanguagePreference/
    ├── index.ts                  # EXISTS (REQ-358)
    └── LanguagePreferenceSection.tsx  # EXISTS (REQ-358)
```

### 4.2 Component Integration Flow

```
User clicks "Settings" in nav
         │
         ▼
/dashboard2/settings/page.tsx loads
         │
         ├── AuthContext provides user data
         │
         ├── Renders LanguagePreferenceSection
         │    │
         │    └── useLanguagePreference hook:
         │         - Fetches current preference from /api/user/language
         │         - Pre-populates dropdown
         │         - Handles save via PUT /api/user/language
         │
         └── Page renders with success/error states
```

### 4.3 Navigation Item Structure

```typescript
// Addition to navigationItems array in layout.tsx
{
  name: 'Settings',
  mobileLabel: 'Set.',
  href: '/dashboard2/settings',
  icon: Settings,  // from lucide-react
}
```

---

## 5. Implementation Tasks

### Task 6.3.1: Create Account Settings Page

**File:** `/src/app/dashboard2/settings/page.tsx`

**Action:** Create a new settings page that integrates LanguagePreferenceSection.

**Implementation Details:**

```typescript
// /src/app/dashboard2/settings/page.tsx
// REQ-360: Account Settings Page - Language Preference Integration
// Phase: 6 - Language Preference Setting
// Task ID: 6.3
// Last Modified: 2026-01-19

'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Loader2, CheckCircle } from 'lucide-react';
import { LanguagePreferenceSection } from '@/components/TranslationManagement';
import type { SupportedLanguage } from '@/components/LanguageSwitcher/constants';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handler for successful language save
  const handleLanguageSave = useCallback((language: SupportedLanguage) => {
    setSuccessMessage(`Language preference updated to ${language.toUpperCase()}`);
    // Clear after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  // Handler for save errors
  const handleSaveError = useCallback((error: string) => {
    console.error('Settings save error:', error);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Authentication check
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
          <Settings className="h-6 w-6 text-[#FF385C]" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
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
          <CheckCircle className="w-5 h-5" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Language Preference Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200">
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
      */}
    </div>
  );
}
```

---

### Task 6.3.2: Update Dashboard Layout Navigation

**File:** `/src/app/dashboard2/layout.tsx`

**Action:** Add Settings navigation item to the dashboard navigation.

**Modification Required:**

1. Import `Settings` icon (if not already imported)
2. Add Settings to `navigationItems` array

**Code Changes:**

```typescript
// Line ~20 - Import Settings icon (add to existing imports)
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package, Settings } from 'lucide-react';

// Lines ~42-67 - Add Settings to navigationItems array
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
  // REQ-360: Add Settings navigation item
  {
    name: 'Settings',
    mobileLabel: 'Set.',
    href: '/dashboard2/settings',
    icon: Settings,
  },
];
```

---

### Task 6.3.3: Verify TranslationManagement Exports

**File:** `/src/components/TranslationManagement/index.ts`

**Action:** Verify that LanguagePreferenceSection is properly exported from the TranslationManagement barrel.

**Expected Content:**

```typescript
// /src/components/TranslationManagement/index.ts
// REQ-358, REQ-360: TranslationManagement barrel exports
// Last Modified: 2026-01-19

export * from './LanguagePreference';
```

**If file doesn't exist or needs creation, create it with the above content.**

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/dashboard2/settings/page.tsx` | Account settings page with LanguagePreferenceSection integration |

### 6.2 Files to Modify

| File Path | Modification | Lines Affected |
|-----------|--------------|----------------|
| `/src/app/dashboard2/layout.tsx` | Add Settings import and nav item | ~20, ~42-67 |
| `/src/components/TranslationManagement/index.ts` | Verify/add LanguagePreference export | All (if creating) |

### 6.3 Files to Import (DO NOT MODIFY)

| File Path | Imported Items |
|-----------|----------------|
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | `LanguagePreferenceSection` component |
| `/src/hooks/useLanguagePreference.ts` | Used internally by LanguagePreferenceSection |
| `/src/contexts/AuthContext.tsx` | `useAuth` hook |
| `/src/components/LanguageSwitcher/constants.ts` | `SupportedLanguage` type |

### 6.4 Functions/Components to Create

| Component/Function | Location | Purpose |
|--------------------|----------|---------|
| `SettingsPage` | `/src/app/dashboard2/settings/page.tsx` | Main settings page component |

### 6.5 Existing Dependencies Used

| Dependency | Source | Usage |
|------------|--------|-------|
| `useAuth` | `/src/contexts/AuthContext.tsx` | Authentication state |
| `LanguagePreferenceSection` | `/src/components/TranslationManagement/` | Language preference UI |
| `Settings` icon | `lucide-react` | Page and nav icons |
| `Loader2` icon | `lucide-react` | Loading state |
| `CheckCircle` icon | `lucide-react` | Success message |

---

## 7. Acceptance Criteria Checklist

From REQ-360:

- [ ] Decision documented regarding placement in account settings versus profile page
- [ ] LanguagePreferenceSection component is imported and rendered on the chosen page
- [ ] Component receives the current account data including existing language preference as props or via API fetch
- [ ] Language dropdown pre-populates with the property owner's current language preference from account data
- [ ] Section appears with a clear heading like "Language Preference" or "Interface Language"
- [ ] Component is positioned logically within the page layout, grouped with related settings if applicable
- [ ] Component styling is consistent with other sections on the same page
- [ ] Page layout remains responsive and properly accommodates the new section on all viewport sizes
- [ ] Property owners can navigate to the page containing the language preference section through existing navigation patterns
- [ ] Changes saved through the component are immediately reflected if the property owner revisits the settings page
- [ ] Loading state is handled appropriately while account data is being fetched
- [ ] Error state is handled appropriately if account data cannot be loaded

---

## 8. Navigation Integration Details

### 8.1 Mobile Navigation Considerations

The Settings nav item uses abbreviated label "Set." for mobile viewports, consistent with existing patterns:
- Dashboard → D/B
- Properties → Prop.
- Guides → Guide
- Settings → Set.

### 8.2 Active State Styling

The navigation in `layout.tsx` already handles active state styling:
- Active: `border-[#FF385C] text-[#FF385C]` (Airbnb red)
- Inactive: `border-transparent text-gray-500 hover:text-gray-700`

No additional styling changes required for the new nav item.

### 8.3 Navigation Icon

Using `Settings` icon from lucide-react (gear icon), which is commonly associated with settings/preferences in application UIs.

---

## 9. Testing Strategy

### 9.1 Manual Testing Checklist

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Navigation visible | Load dashboard | "Settings" nav item appears after "Properties" |
| Navigation works | Click "Settings" | Navigates to `/dashboard2/settings` |
| Page loads | Visit `/dashboard2/settings` | Settings page renders with header |
| Language section visible | View settings page | LanguagePreferenceSection appears in white card |
| Pre-populated preference | View settings page | Dropdown shows current saved preference |
| Save works | Change language, click Save | Success message appears, preference saved |
| Persistence | Refresh page after save | New preference still selected |
| Mobile responsive | View on mobile viewport | Page and nav item display correctly |
| Auth required | Visit without login | Redirect to login or show auth message |

### 9.2 Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No saved preference | Default to 'en' (English) |
| API error on load | Component shows error state with retry option |
| API error on save | Error message displayed, selection not lost |
| Network timeout | Loading state shown, error on timeout |

---

## 10. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LanguagePreferenceSection not created (REQ-358) | Medium | High | Verify component exists before integration |
| Navigation becomes crowded | Low | Medium | Monitor nav count; consider dropdown menu in future |
| Mobile layout issues | Low | Medium | Test on multiple viewport sizes |
| Import path incorrect | Low | Low | Verify barrel export from TranslationManagement |

---

## 11. Future Enhancements

This settings page provides a foundation for additional account preferences:

| Future Section | Description |
|----------------|-------------|
| Notification Preferences | Email/push notification settings |
| Privacy Settings | Data sharing preferences |
| Security Settings | Password change, 2FA |
| Account Deletion | Account removal option |

---

## 12. References

- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-360)
- **Related Requests:**
  - REQ-358: Create LanguagePreferenceSection component
  - REQ-359: Create account preference API endpoint
- **Pattern References:**
  - `/src/app/dashboard2/properties/page.tsx` - Page structure pattern
  - `/src/app/dashboard2/layout.tsx` - Navigation pattern
  - `/src/app/dashboard2/help/page.tsx` - Page header pattern

---

*Document generated for FAQBNB Localization Epic 5 - Task 6.3: Integrate into account settings (or profile)*
