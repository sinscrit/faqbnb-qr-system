# REQ-E05-027: Integrate Language Preference Section into Account Settings - Detailed Task Breakdown

**Generated:** 2026-01-20 23:15 UTC
**Last Modified:** 2026-01-20 23:15 UTC
**Overview Document:** docs/REQ-E05-027-integrate-into-account-settings-or-profile-overview.md
**Request Source:** docs/gen_requests_epic5.md - Request #28 (REQ-E05-028)
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.3

---

## Executive Summary

This document provides granular, actionable implementation tasks for integrating the LanguagePreferenceSection component into an account settings page. Since no dedicated account settings page currently exists in the dashboard, this implementation includes creating the account settings page route, adding navigation, and integrating the language preference component.

**Total Estimated Tasks:** 8 tasks
**Complexity:** Medium
**Dependencies:** REQ-E05-026 (LanguagePreferenceSection Component), REQ-E05-027 (Account Preference API Endpoint)

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] REQ-E05-026 (LanguagePreferenceSection Component) is complete
  - File exists: `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
  - Component is exported from index file
- [ ] REQ-E05-027 (Account Preference API Endpoint) is complete
  - API route exists: `/src/app/api/accounts/[accountId]/preferences/route.ts`
  - PUT endpoint accepts `preferredLanguage` field
- [ ] LocaleContext is available and functional
  - File: `/src/contexts/LocaleContext.tsx`
  - Exports: `useLocale`, `SupportedLanguage`, `SUPPORTED_LOCALES`

---

## Task Breakdown

### Task 1: Create Account Settings Page File Structure

**File:** `/src/app/dashboard2/account/page.tsx`
**Type:** New File
**Estimated Effort:** 1 story point
**Priority:** Required

**Description:**
Create the new account settings page file with the basic structure following the help page pattern.

**Implementation Steps:**

1. Create directory `/src/app/dashboard2/account/` if it doesn't exist
2. Create `page.tsx` with 'use client' directive
3. Add file header comment with documentation

**Code Template:**
```typescript
'use client';

/**
 * Account Settings Page - Dashboard2
 *
 * REQ-E05-027: Integrate Language Preference Section into Account Settings
 * Phase 6, Task 6.3
 *
 * Provides account configuration options including:
 * - Language Preference (dashboard interface language)
 * - Account Information (read-only display)
 *
 * @route /dashboard2/account
 * @created 2026-01-20
 * @modified 2026-01-20
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, SupportedLanguage } from '@/contexts/LocaleContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Settings,
  Loader2,
  Shield,
  Languages,
  User,
} from 'lucide-react';

// Component implementation continues in subsequent tasks...
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] 'use client' directive present
- [ ] File header includes creation date and REQ reference
- [ ] Required imports added

---

### Task 2: Implement Authentication and Loading States

**File:** `/src/app/dashboard2/account/page.tsx`
**Type:** Modify (add to Task 1 file)
**Estimated Effort:** 1 story point
**Priority:** Required

**Description:**
Add authentication checks, permission validation, and loading states following the help page pattern.

**Implementation Steps:**

1. Use `useAuth` hook to get user, loading state, and currentAccount
2. Use `usePermissions` hook for access control
3. Implement loading spinner during auth check
4. Implement redirect for unauthenticated users
5. Implement access denied display for unauthorized users

**Code Implementation:**
```typescript
export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, currentAccount } = useAuth();
  const { locale, setLocale, isLoading: localeLoading } = useLocale();
  const { useCanAccess, isLoading: permissionsLoading } = usePermissions(user, currentAccount);

  const canViewItems = useCanAccess('view_items');

  // Loading state - show spinner while checking auth/permissions
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">Loading account settings...</p>
        </div>
      </div>
    );
  }

  // Authentication check - redirect to login if not authenticated
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access account settings.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Authorization check - show access denied if no permissions
  if (!canViewItems.granted) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You do not have permission to view account settings.</p>
        <Link
          href="/dashboard2"
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Main content - implemented in Task 3
  return (
    <div role="main" aria-labelledby="account-settings-title">
      {/* Page content */}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Loading spinner displays during auth check
- [ ] Unauthenticated users see login prompt
- [ ] Unauthorized users see access denied message
- [ ] All states use consistent styling with help page

---

### Task 3: Implement Page Layout and Header

**File:** `/src/app/dashboard2/account/page.tsx`
**Type:** Modify (add to main return statement)
**Estimated Effort:** 1 story point
**Priority:** Required

**Description:**
Create the page layout structure with header, description, and section containers.

**Implementation Steps:**

1. Add page header with Settings icon and title
2. Add page description text
3. Create container structure for settings sections
4. Follow card-based layout pattern from help page

**Code Implementation:**
```typescript
// Inside the main return statement after auth checks:
return (
  <div role="main" aria-labelledby="account-settings-title">
    {/* Page Header */}
    <div className="mb-8">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-[#FF385C]" aria-hidden="true" />
        <h1 id="account-settings-title" className="text-2xl font-bold text-gray-900">
          Account Settings
        </h1>
      </div>
      <p className="text-gray-600 mt-1">
        Manage your account preferences and settings
      </p>
    </div>

    {/* Settings Sections Container */}
    <div className="space-y-6">
      {/* Language Preference Section - Task 4 */}

      {/* Account Information Section - Task 5 */}
    </div>
  </div>
);
```

**Acceptance Criteria:**
- [ ] Page header displays with Settings icon
- [ ] Page title is "Account Settings"
- [ ] Description text explains page purpose
- [ ] Section container uses consistent spacing (space-y-6)

---

### Task 4: Integrate LanguagePreferenceSection Component

**File:** `/src/app/dashboard2/account/page.tsx`
**Type:** Modify (add to settings sections container)
**Estimated Effort:** 2 story points
**Priority:** Required

**Description:**
Import and render the LanguagePreferenceSection component within a styled card section, passing required props.

**Implementation Steps:**

1. Import LanguagePreferenceSection from TranslationManagement
2. Create language preference section container with card styling
3. Add section header with Languages icon
4. Pass required props: accountId, currentLanguage, onLanguageChange
5. Implement handleLanguageChange callback to update LocaleContext

**Code Implementation:**

Add to imports:
```typescript
import { LanguagePreferenceSection } from '@/components/TranslationManagement/LanguagePreference';
```

Add state for language change handling:
```typescript
const [isSaving, setIsSaving] = useState(false);
const [saveError, setSaveError] = useState<string | null>(null);

/**
 * Handle language preference change
 * Updates LocaleContext to apply changes immediately
 */
const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
  setIsSaving(true);
  setSaveError(null);

  try {
    const result = await setLocale(newLanguage);
    if (!result.success) {
      setSaveError(result.error || 'Failed to update language preference');
    }
  } catch (error) {
    setSaveError('An unexpected error occurred');
    console.error('AccountSettings: Language change error:', error);
  } finally {
    setIsSaving(false);
  }
};
```

Add section to settings container:
```typescript
{/* Language Preference Section */}
<section
  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
  aria-labelledby="language-preference-heading"
>
  <div className="px-6 py-4 border-b border-gray-100">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-[#FFEEEF]">
        <Languages className="w-5 h-5 text-[#FF385C]" aria-hidden="true" />
      </div>
      <div>
        <h2 id="language-preference-heading" className="text-lg font-semibold text-gray-900">
          Language Preference
        </h2>
        <p className="text-sm text-gray-500">
          Set your preferred dashboard interface language
        </p>
      </div>
    </div>
  </div>
  <div className="p-6">
    <LanguagePreferenceSection
      accountId={currentAccount?.id}
      currentLanguage={locale}
      onLanguageChange={handleLanguageChange}
    />
    {saveError && (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{saveError}</p>
      </div>
    )}
  </div>
</section>
```

**Acceptance Criteria:**
- [ ] LanguagePreferenceSection is imported correctly
- [ ] Component renders within styled card section
- [ ] Section header displays "Language Preference" with Languages icon
- [ ] accountId prop receives currentAccount.id
- [ ] currentLanguage prop receives locale from LocaleContext
- [ ] onLanguageChange callback updates locale via setLocale
- [ ] Error messages display when save fails
- [ ] Section matches card styling pattern

---

### Task 5: Add Account Information Section (Read-Only)

**File:** `/src/app/dashboard2/account/page.tsx`
**Type:** Modify (add to settings sections container)
**Estimated Effort:** 1 story point
**Priority:** Optional (but recommended for completeness)

**Description:**
Add a read-only account information section displaying the current user's account details.

**Implementation Steps:**

1. Create account information section with card styling
2. Display account name (from currentAccount)
3. Display user email (from user)
4. Display user role if available
5. Style as read-only information display

**Code Implementation:**
```typescript
{/* Account Information Section */}
<section
  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
  aria-labelledby="account-info-heading"
>
  <div className="px-6 py-4 border-b border-gray-100">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-[#FFEEEF]">
        <User className="w-5 h-5 text-[#FF385C]" aria-hidden="true" />
      </div>
      <div>
        <h2 id="account-info-heading" className="text-lg font-semibold text-gray-900">
          Account Information
        </h2>
        <p className="text-sm text-gray-500">
          Your account details
        </p>
      </div>
    </div>
  </div>
  <div className="p-6 space-y-4">
    {/* Account Name */}
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        Account Name
      </label>
      <p className="text-gray-900">
        {currentAccount?.name || 'N/A'}
      </p>
    </div>

    {/* Email */}
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        Email
      </label>
      <p className="text-gray-900">
        {user?.email || 'N/A'}
      </p>
    </div>

    {/* Role (if available) */}
    {currentAccount?.role && (
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">
          Role
        </label>
        <p className="text-gray-900 capitalize">
          {currentAccount.role}
        </p>
      </div>
    )}
  </div>
</section>
```

**Acceptance Criteria:**
- [ ] Account information section displays below language preference
- [ ] Section shows account name from currentAccount
- [ ] Section shows user email
- [ ] Section shows role if available
- [ ] Information is read-only (no edit capability)
- [ ] Section matches card styling pattern

---

### Task 6: Add Settings Navigation Item to Dashboard Layout

**File:** `/src/app/dashboard2/layout.tsx`
**Type:** Modify
**Estimated Effort:** 1 story point
**Priority:** Required

**Description:**
Add an "Account" navigation item to the dashboard navigation bar to provide access to the account settings page.

**Implementation Steps:**

1. Import Settings icon from lucide-react (already imported as `Settings`)
2. Add new NavItem to navigationItems array after Properties
3. Set href to '/dashboard2/account'
4. Use appropriate mobile label

**Code Changes:**

Locate the `navigationItems` array (around line 42) and add:
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
  // NEW: Account settings navigation item
  {
    name: 'Account',
    mobileLabel: 'Acct.',
    href: '/dashboard2/account',
    icon: Settings,
  },
];
```

Note: The `Settings` icon is already imported from lucide-react but used only in help page. Verify it's imported in layout.tsx, if not add:
```typescript
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package, Settings } from 'lucide-react';
```

**Acceptance Criteria:**
- [ ] "Account" nav item appears in navigation bar
- [ ] Nav item uses Settings icon
- [ ] Nav item links to `/dashboard2/account`
- [ ] Mobile label shows "Acct."
- [ ] Nav item highlights when on account page
- [ ] Navigation order is: Dashboard, Items, Guides, Properties, Account

---

### Task 7: Handle Edge Cases and Error States

**File:** `/src/app/dashboard2/account/page.tsx`
**Type:** Modify
**Estimated Effort:** 1 story point
**Priority:** Required

**Description:**
Add robust handling for edge cases including missing account context, null values, and network errors.

**Implementation Steps:**

1. Handle missing currentAccount gracefully
2. Handle locale loading state
3. Add error boundary behavior for component-level errors
4. Ensure graceful degradation when API calls fail

**Code Implementation:**

Add additional checks and UI handling:
```typescript
// After auth checks but before main content:

// Handle missing account context
if (!currentAccount) {
  return (
    <div className="text-center py-12">
      <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-gray-900 mb-4">No Account Selected</h2>
      <p className="text-gray-600 mb-6">
        Please select a property from the dropdown to access account settings.
      </p>
      <Link
        href="/dashboard2"
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors inline-block"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

// Show loading overlay during locale changes
{localeLoading && (
  <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-[#FF385C]" />
      <span className="text-gray-700">Updating language...</span>
    </div>
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Missing account shows appropriate message
- [ ] Locale loading shows overlay indicator
- [ ] Network errors display user-friendly messages
- [ ] Page remains functional with partial data

---

### Task 8: Accessibility and Keyboard Navigation

**File:** `/src/app/dashboard2/account/page.tsx`
**Type:** Modify
**Estimated Effort:** 1 story point
**Priority:** Required

**Description:**
Ensure the account settings page meets accessibility standards with proper ARIA labels, semantic HTML, and keyboard navigation support.

**Implementation Steps:**

1. Add ARIA labels to all interactive elements
2. Ensure proper heading hierarchy (h1, h2)
3. Add role attributes where needed
4. Test keyboard navigation through all controls
5. Ensure screen reader announces section changes

**Code Review Checklist:**

Verify the following accessibility features:
```typescript
// Page landmark
<div role="main" aria-labelledby="account-settings-title">

// Section landmarks
<section aria-labelledby="language-preference-heading">
<section aria-labelledby="account-info-heading">

// Heading IDs for ARIA references
<h1 id="account-settings-title">
<h2 id="language-preference-heading">
<h2 id="account-info-heading">

// Icons have aria-hidden
<Settings className="..." aria-hidden="true" />
<Languages className="..." aria-hidden="true" />
<User className="..." aria-hidden="true" />

// Form labels associated properly
<label className="...">Language</label>
// Dropdown should have id matching aria-labelledby

// Error messages accessible
<div role="alert" aria-live="polite">
  <p className="text-sm text-red-600">{saveError}</p>
</div>
```

**Acceptance Criteria:**
- [ ] Page uses semantic HTML landmarks
- [ ] All headings have proper IDs for ARIA references
- [ ] Interactive elements have accessible names
- [ ] Icons have aria-hidden="true"
- [ ] Error messages use role="alert"
- [ ] Tab order flows logically through controls
- [ ] Screen reader announces status changes

---

## Complete File Template

Below is the complete implementation of `/src/app/dashboard2/account/page.tsx`:

```typescript
'use client';

/**
 * Account Settings Page - Dashboard2
 *
 * REQ-E05-027: Integrate Language Preference Section into Account Settings
 * Phase 6, Task 6.3
 *
 * Provides account configuration options including:
 * - Language Preference (dashboard interface language)
 * - Account Information (read-only display)
 *
 * @route /dashboard2/account
 * @created 2026-01-20
 * @modified 2026-01-20
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale, SupportedLanguage } from '@/contexts/LocaleContext';
import { usePermissions } from '@/hooks/usePermissions';
import { LanguagePreferenceSection } from '@/components/TranslationManagement/LanguagePreference';
import {
  Settings,
  Loader2,
  Shield,
  Languages,
  User,
} from 'lucide-react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, currentAccount } = useAuth();
  const { locale, setLocale, isLoading: localeLoading } = useLocale();
  const { useCanAccess, isLoading: permissionsLoading } = usePermissions(user, currentAccount);

  const canViewItems = useCanAccess('view_items');

  // State for language change handling
  const [saveError, setSaveError] = useState<string | null>(null);

  /**
   * Handle language preference change
   * Updates LocaleContext to apply changes immediately
   */
  const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
    setSaveError(null);

    try {
      const result = await setLocale(newLanguage);
      if (!result.success) {
        setSaveError(result.error || 'Failed to update language preference');
      }
    } catch (error) {
      setSaveError('An unexpected error occurred');
      console.error('AccountSettings: Language change error:', error);
    }
  };

  // Loading state - show spinner while checking auth/permissions
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">Loading account settings...</p>
        </div>
      </div>
    );
  }

  // Authentication check - redirect to login if not authenticated
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access account settings.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Authorization check - show access denied if no permissions
  if (!canViewItems.granted) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You do not have permission to view account settings.</p>
        <Link
          href="/dashboard2"
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Handle missing account context
  if (!currentAccount) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-gray-900 mb-4">No Account Selected</h2>
        <p className="text-gray-600 mb-6">
          Please select a property from the dropdown to access account settings.
        </p>
        <Link
          href="/dashboard2"
          className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Main content
  return (
    <div role="main" aria-labelledby="account-settings-title">
      {/* Loading overlay during locale changes */}
      {localeLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#FF385C]" aria-hidden="true" />
            <span className="text-gray-700">Updating language...</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#FF385C]" aria-hidden="true" />
          <h1 id="account-settings-title" className="text-2xl font-bold text-gray-900">
            Account Settings
          </h1>
        </div>
        <p className="text-gray-600 mt-1">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Settings Sections Container */}
      <div className="space-y-6">
        {/* Language Preference Section */}
        <section
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          aria-labelledby="language-preference-heading"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FFEEEF]">
                <Languages className="w-5 h-5 text-[#FF385C]" aria-hidden="true" />
              </div>
              <div>
                <h2 id="language-preference-heading" className="text-lg font-semibold text-gray-900">
                  Language Preference
                </h2>
                <p className="text-sm text-gray-500">
                  Set your preferred dashboard interface language
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <LanguagePreferenceSection
              accountId={currentAccount.id}
              currentLanguage={locale}
              onLanguageChange={handleLanguageChange}
            />
            {saveError && (
              <div role="alert" aria-live="polite" className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{saveError}</p>
              </div>
            )}
          </div>
        </section>

        {/* Account Information Section */}
        <section
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          aria-labelledby="account-info-heading"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FFEEEF]">
                <User className="w-5 h-5 text-[#FF385C]" aria-hidden="true" />
              </div>
              <div>
                <h2 id="account-info-heading" className="text-lg font-semibold text-gray-900">
                  Account Information
                </h2>
                <p className="text-sm text-gray-500">
                  Your account details
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Account Name
              </label>
              <p className="text-gray-900">
                {currentAccount.name || 'N/A'}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-gray-900">
                {user.email || 'N/A'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

## Testing Checklist

### Manual Testing

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Page loads successfully | Navigate to /dashboard2/account | Page displays with language and account sections |
| Auth redirect works | Log out, try to access page | Redirects to login |
| Language dropdown shows current | Load page | Dropdown pre-selects current locale |
| Language change saves | Select new language, click Save | UI updates, toast shows success |
| Language change persists | Change language, refresh page | New language still selected |
| Account info displays | Load page with account | Shows account name and email |
| Navigation highlight | Click Account nav item | Nav item shows active state |
| Mobile layout | Resize to 375px width | Layout remains usable |
| Keyboard navigation | Tab through all controls | Focus moves logically |

### Accessibility Testing

| Test | Method | Expected |
|------|--------|----------|
| Screen reader | VoiceOver/NVDA | All sections announced, labels read |
| Keyboard only | Tab, Enter, Space | All functions accessible |
| Color contrast | axe DevTools | No contrast violations |
| Heading structure | WAVE tool | h1 > h2 hierarchy maintained |

---

## Dependencies Graph

```
REQ-E05-026 (LanguagePreferenceSection)
        │
        ▼
REQ-E05-027 (Account Preference API) ──┐
        │                               │
        ▼                               ▼
REQ-E05-028 (This Task: Integration) ◄──┘
        │
        ├── Task 1: Create page file
        ├── Task 2: Auth/loading states
        ├── Task 3: Page layout
        ├── Task 4: Integrate LanguagePreferenceSection
        ├── Task 5: Account info section
        ├── Task 6: Navigation item
        ├── Task 7: Edge cases
        └── Task 8: Accessibility
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LanguagePreferenceSection not ready | Medium | High | Verify prerequisite complete before starting |
| LocaleContext API mismatch | Low | Medium | Use existing LocaleContext patterns |
| Navigation breaks on mobile | Low | Low | Test responsive layout early |
| Settings icon conflict | Low | Low | Icon already available in lucide-react |

---

## Definition of Done

- [ ] All 8 tasks completed and verified
- [ ] Account settings page accessible at /dashboard2/account
- [ ] Navigation item added and functional
- [ ] LanguagePreferenceSection integrated and working
- [ ] Language changes persist across sessions
- [ ] Page follows existing dashboard patterns
- [ ] Accessibility requirements met
- [ ] Manual testing checklist passed
- [ ] Code reviewed and follows project conventions
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Build succeeds

---

## References

- Overview Document: `/docs/REQ-E05-027-integrate-into-account-settings-or-profile-overview.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- LocaleContext: `/src/contexts/LocaleContext.tsx`
- Dashboard Layout: `/src/app/dashboard2/layout.tsx`
- Help Page Pattern: `/src/app/dashboard2/help/page.tsx`
- Request Definition: `/docs/gen_requests_epic5.md` (REQ-E05-028)

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Phase 6, Task 6.3: Integrate into account settings (or profile)*
*Last Modified: 2026-01-20 23:15 UTC*
