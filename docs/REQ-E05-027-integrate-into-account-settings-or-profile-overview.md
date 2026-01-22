# REQ-E05-027: Integrate Language Preference into Account Settings - Implementation Breakdown

**Request ID**: REQ-E05-027
**Epic**: Epic 5 - Owner Translation Management
**Phase**: Phase 6 - Language Preference Setting
**Task**: Task 6.3 - Integrate into account settings (or profile)
**Created**: 2026-01-22 20:29
**Status**: PENDING

---

## Goal

Integrate the LanguagePreferenceSection component into a new Account Settings page at `/dashboard2/settings`, providing property owners with a centralized location to view and update their language preference. The page fetches the current preference from the API, pre-populates the selector, and persists changes back to the database through the Account Preference API endpoint.

---

## Implementation Plan

### Step 1: Create Account Settings Page Route

**File**: `/src/app/dashboard2/settings/page.tsx` (NEW)

**Rationale**: Create dedicated settings page following Next.js App Router conventions.

**Implementation**:

```typescript
'use client';

/**
 * Account Settings Page
 *
 * REQ-E05-027: Integrate Language Preference into Account Settings
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.3
 *
 * Centralized location for account-level settings including language preference.
 *
 * @route /dashboard2/settings
 * @created 2026-01-22 20:29
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, Settings } from 'lucide-react';
import { LanguagePreferenceSection } from '@/components/TranslationManagement/LanguagePreference';
import { getLanguageOptions } from '@/lib/i18n';

export default function AccountSettingsPage() {
  const { user, currentAccount } = useAuth();
  const t = useTranslations('settings');

  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accountId = currentAccount?.id;

  // Fetch current preferences on mount
  useEffect(() => {
    async function fetchPreferences() {
      if (!accountId) {
        setError('No account ID available');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/accounts/${accountId}/preferences`);
        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }
        const data = await response.json();
        if (data.success) {
          setCurrentLanguage(data.data.preferences.preferredLanguage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
        console.error('Error fetching preferences:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [accountId]);

  // Handle save preference
  const handleSaveLanguagePreference = async (languageCode: string) => {
    if (!accountId) {
      throw new Error('No account ID available');
    }

    const response = await fetch(`/api/accounts/${accountId}/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredLanguage: languageCode }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to save preference');
    }

    const data = await response.json();
    if (data.success) {
      setCurrentLanguage(data.data.preferences.preferredLanguage);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        </div>
        <p className="text-gray-600">{t('description')}</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Language Preference Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <LanguagePreferenceSection
            currentLanguage={currentLanguage}
            availableLanguages={getLanguageOptions()}
            onSave={handleSaveLanguagePreference}
          />
        </div>

        {/* Future settings sections can be added here */}
        {/* Example: Notification Settings, Display Settings, etc. */}
      </div>
    </div>
  );
}
```

**Key Design Decisions**:
- Uses `currentAccount?.id` from AuthContext (already available)
- Gets available languages from `getLanguageOptions()` helper (created in REQ-E05-025)
- Fetches current preference on mount via GET /api/accounts/[accountId]/preferences
- Error handling for missing accountId and API failures
- Loading spinner during initial fetch
- Responsive max-width container (max-w-2xl) for optimal readability

**Estimated Effort**: 2-3 hours

---

### Step 2: Add Navigation Link to Dashboard

**File**: `/src/app/dashboard2/Dashboard2LayoutClient.tsx` (lines 52-77)

**Rationale**: Add Settings navigation item to make the page accessible from the dashboard menu.

**Implementation**:

Add to `navigationItems` array after Properties item:

```typescript
// Around line 76, after the Properties navigation item
{
  name: t('nav.settings'),
  mobileLabel: t('nav.mobile.settings'),
  href: '/dashboard2/settings',
  icon: Settings,
},
```

**Import Addition** (around line 20):
```typescript
import { Building2, FileText, LayoutDashboard, Loader2, LogOut, Package, Settings } from 'lucide-react';
```

**Visual Position**: Settings will appear as the last item in navigation (after Dashboard, Items, Guides, Properties).

**Estimated Effort**: 15 minutes

---

### Step 3: Add Translation Keys for All Locales

**Files**: `/messages/en.json`, `/messages/es.json`, `/messages/fr.json`, `/messages/de.json`, `/messages/it.json`, `/messages/nl.json`

**Rationale**: Support i18n for all UI text in the settings page.

**Implementation**:

Add to each locale file:

**English (`/messages/en.json`)**:
```json
{
  "settings": {
    "title": "Account Settings",
    "description": "Manage your account preferences and settings."
  },
  "dashboard": {
    "nav": {
      "settings": "Settings"
    },
    "nav.mobile": {
      "settings": "Settings"
    }
  }
}
```

**Spanish (`/messages/es.json`)**:
```json
{
  "settings": {
    "title": "Configuración de cuenta",
    "description": "Administre las preferencias y configuraciones de su cuenta."
  },
  "dashboard": {
    "nav": {
      "settings": "Configuración"
    },
    "nav.mobile": {
      "settings": "Config."
    }
  }
}
```

**French (`/messages/fr.json`)**:
```json
{
  "settings": {
    "title": "Paramètres du compte",
    "description": "Gérez les préférences et les paramètres de votre compte."
  },
  "dashboard": {
    "nav": {
      "settings": "Paramètres"
    },
    "nav.mobile": {
      "settings": "Param."
    }
  }
}
```

**German (`/messages/de.json`)**:
```json
{
  "settings": {
    "title": "Kontoeinstellungen",
    "description": "Verwalten Sie Ihre Kontopräferenzen und -einstellungen."
  },
  "dashboard": {
    "nav": {
      "settings": "Einstellungen"
    },
    "nav.mobile": {
      "settings": "Einstell."
    }
  }
}
```

**Italian (`/messages/it.json`)**:
```json
{
  "settings": {
    "title": "Impostazioni account",
    "description": "Gestisci le preferenze e le impostazioni del tuo account."
  },
  "dashboard": {
    "nav": {
      "settings": "Impostazioni"
    },
    "nav.mobile": {
      "settings": "Impost."
    }
  }
}
```

**Dutch (`/messages/nl.json`)**:
```json
{
  "settings": {
    "title": "Accountinstellingen",
    "description": "Beheer uw accountvoorkeuren en -instellingen."
  },
  "dashboard": {
    "nav": {
      "settings": "Instellingen"
    },
    "nav.mobile": {
      "settings": "Instell."
    }
  }
}
```

**Note**: Abbreviated mobile labels keep navigation compact on small screens.

**Estimated Effort**: 1 hour

---

### Step 4: Add Route Protection (Authentication Check)

**File**: `/src/app/dashboard2/settings/page.tsx`

**Rationale**: Ensure page is only accessible to authenticated users.

**Implementation**:

The page already uses `useAuth()` which handles authentication. The Dashboard2LayoutClient.tsx wrapper provides authentication protection at the layout level. No additional protection needed in the page component itself.

**Verification**:
- Dashboard2LayoutClient already redirects to `/login` if user is unauthorized
- Settings page inherits this protection
- No additional middleware or guards required

**Estimated Effort**: 0 hours (already handled by layout)

---

### Step 5: Create Integration Tests

**File**: `/src/app/dashboard2/settings/__tests__/page.test.tsx` (NEW)

**Rationale**: Ensure settings page behaves correctly under all scenarios.

**Test Cases**:
1. **Rendering Tests**:
   - Renders page header with Settings icon and title
   - Renders LanguagePreferenceSection component
   - Shows loading spinner during initial fetch
   - Shows error message when API fetch fails

2. **Data Fetching Tests**:
   - Fetches preferences from /api/accounts/[accountId]/preferences on mount
   - Pre-populates LanguagePreferenceSection with fetched preference
   - Handles null preference (new user with no saved preference)
   - Handles missing accountId gracefully

3. **Save Functionality Tests**:
   - Calls PUT /api/accounts/[accountId]/preferences on save
   - Updates local state after successful save
   - Shows error from LanguagePreferenceSection on save failure
   - Persists accountId across save operations

4. **Integration Tests**:
   - Works with LanguagePreferenceSection component
   - Passes correct props to LanguagePreferenceSection
   - Handles onSave callback correctly

5. **Authentication Tests**:
   - Redirects to login if user not authenticated (handled by layout)
   - Displays error if accountId is not available

**Estimated Effort**: 2-3 hours

---

### Step 6: Manual Testing Checklist

**Rationale**: Verify all acceptance criteria and user flows before deployment.

**Test Scenarios**:

1. **Navigation Access**:
   - ✅ Click Settings in dashboard navigation
   - ✅ Settings page loads at /dashboard2/settings
   - ✅ Settings icon appears correctly in navigation
   - ✅ Mobile navigation shows abbreviated "Settings" label

2. **Initial Load**:
   - ✅ Loading spinner displays briefly
   - ✅ Current language preference pre-populated in dropdown
   - ✅ For new user with no preference: defaults to first language (English)
   - ✅ Page header displays "Account Settings" title
   - ✅ Description text displays below title

3. **Language Change and Save**:
   - Change language dropdown to French
   - ✅ Save button becomes enabled
   - Click Save
   - ✅ "Saving..." spinner appears in button
   - ✅ Success message displays after save
   - ✅ Success message disappears after 3 seconds
   - Reload page
   - ✅ French remains selected (persisted)

4. **Error Handling**:
   - Simulate API error (e.g., network offline)
   - ✅ Error message displays in red box
   - ✅ User can retry after fixing issue

5. **Responsiveness**:
   - View on mobile (< 640px)
   - ✅ Layout remains usable
   - ✅ Language dropdown doesn't overflow
   - ✅ Save button accessible
   - ✅ Navigation shows "Settings" (abbreviated)

6. **i18n Verification**:
   - Switch UI language to each supported locale
   - ✅ English: "Account Settings"
   - ✅ Spanish: "Configuración de cuenta"
   - ✅ French: "Paramètres du compte"
   - ✅ German: "Kontoeinstellungen"
   - ✅ Italian: "Impostazioni account"
   - ✅ Dutch: "Accountinstellingen"

7. **Authentication**:
   - Log out
   - Try to access /dashboard2/settings directly
   - ✅ Redirects to /login
   - Log in
   - ✅ Can access settings page again

**Estimated Effort**: 1-2 hours

---

### Step 7: Update Documentation

**File**: `/docs/user-guide/account-settings.md` (NEW - Optional)

**Rationale**: Document the new settings page for users and future developers.

**Content**:

```markdown
# Account Settings

## Overview

The Account Settings page provides a centralized location to manage your account preferences and settings.

**Location**: Dashboard → Settings

**URL**: `/dashboard2/settings`

## Language Preference

### What It Does

The Language Preference setting determines your preferred language for viewing and managing content throughout the FAQBNB platform. This setting affects:

- Default language displayed in translation management views
- Which language is prioritized in translation workflows
- UI language preference (future enhancement)

### How to Change Your Language Preference

1. Navigate to Dashboard → Settings
2. Find the "Language Preference" section
3. Select your preferred language from the dropdown
4. Click the "Save" button
5. Your preference is saved and will be applied immediately

### Supported Languages

- English (en)
- French (fr)
- Spanish (es)
- German (de)
- Italian (it)
- Dutch (nl)

## Future Settings

This page will be extended with additional settings sections including:
- Notification preferences
- Display options
- Translation workflow preferences
```

**Estimated Effort**: 30 minutes (optional)

---

## Authorized Files for Modification

### New Files to Create
1. `/src/app/dashboard2/settings/page.tsx` - Main settings page component
2. `/src/app/dashboard2/settings/__tests__/page.test.tsx` - Unit/integration tests
3. `/docs/user-guide/account-settings.md` - User documentation (optional)

### Existing Files to Modify
1. `/src/app/dashboard2/Dashboard2LayoutClient.tsx` (line ~76) - Add Settings navigation item
2. `/messages/en.json` - Add English translation keys
3. `/messages/es.json` - Add Spanish translation keys
4. `/messages/fr.json` - Add French translation keys
5. `/messages/de.json` - Add German translation keys
6. `/messages/it.json` - Add Italian translation keys
7. `/messages/nl.json` - Add Dutch translation keys

### Files to Reference (No Changes)
- `/src/contexts/AuthContext.tsx` - Access `currentAccount.id` for API calls
- `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` - Integrate component
- `/src/lib/i18n/language-options.ts` - Use `getLanguageOptions()` helper
- `/src/app/api/accounts/[accountId]/preferences/route.ts` - API endpoint (REQ-E05-026)

---

## Dependencies

### Required (Must Be Complete First)
- **REQ-E05-025**: LanguagePreferenceSection Component ✅ (must exist)
- **REQ-E05-026**: Account Preference API Endpoint ✅ (must exist)
- **Epic 1 - L10N Foundation**: Language metadata and i18n configuration ✅ (exists)
- **AuthContext**: Must provide `currentAccount` with `id` property ✅ (exists)

### Blocks (Requires This First)
- None - This is the final integration task for Phase 6

### Parallel Safety
- **Files touched**: New settings page + navigation + locale files
- **Conflicts with**: None (isolated integration work)
- **Safe to parallelize with**: All other Epic 5 Phase 7 tasks (different features)

### External Dependencies
- **Supabase Auth**: User authentication via AuthContext
- **Account Preference API**: GET and PUT endpoints must be functional
- **next-intl**: Translation support for UI text

---

## Technical Risks

### 1. Missing AccountId in AuthContext
**Risk**: `currentAccount` may be null or undefined if user hasn't selected an account.

**Mitigation**:
- Check for `accountId` presence before API calls
- Display clear error message if missing
- AuthContext should always have `currentAccount` set for authenticated users in dashboard

**Impact**: Low - AuthContext reliably provides account in Dashboard2.

---

### 2. API Endpoint Not Deployed
**Risk**: Settings page may fail if REQ-E05-026 API endpoint isn't deployed.

**Mitigation**:
- Verify API endpoint exists before deploying settings page
- Test GET and PUT endpoints in staging environment
- Show user-friendly error message if API unavailable

**Impact**: Medium - Requires coordinated deployment of API + UI.

---

### 3. Translation Key Conflicts
**Risk**: New "settings" namespace may conflict with existing keys in locale files.

**Mitigation**:
- Search locale files for existing "settings" keys before adding
- Use nested structure (`settings.title`, `dashboard.nav.settings`)
- Test all locales to ensure no overwrites

**Impact**: Low - Namespace is new and unlikely to conflict.

---

### 4. Navigation Item Overflow on Mobile
**Risk**: Adding Settings to navigation may cause horizontal scrolling on mobile.

**Mitigation**:
- Use abbreviated labels for mobile (`mobileLabel: "Settings"`)
- Test on actual mobile devices (< 640px)
- Dashboard navigation already handles 5+ items responsively

**Impact**: Very Low - Existing navigation is designed for extensibility.

---

### 5. Race Condition on Concurrent Preference Updates
**Risk**: If user opens settings in multiple tabs and saves different preferences, one may be lost.

**Mitigation**:
- API uses last-write-wins strategy (acceptable for preferences)
- Users are unlikely to update preferences frequently
- Consider adding optimistic locking via `updated_at` if needed (future enhancement)

**Impact**: Very Low - Edge case with low business impact.

---

## Out of Scope

### 1. User-Level Preferences (vs Account-Level)
This implementation manages **account-level** preferences stored in the `accounts` table. Individual **user-level** preferences are out of scope.

**Rationale**: Epic 5 focuses on account-level translation management. User-specific settings (e.g., personal UI preferences) would require a different data model.

**Future Enhancement**: Create `/dashboard2/profile` page for user-specific preferences.

---

### 2. Real-Time Preference Synchronization
This page does NOT sync preference changes in real-time across multiple browser tabs/windows.

**Rationale**: Preferences change infrequently and don't require real-time sync. Users will see updated preference on next page reload.

**Future Enhancement**: Use WebSocket or polling to sync preferences across tabs.

---

### 3. Additional Settings Sections
This task only integrates **Language Preference**. Other settings sections are out of scope:
- Notification preferences
- Display settings (theme, density, etc.)
- Translation workflow preferences
- Account management (billing, team members, etc.)

**Rationale**: Phase 6 focuses on language preference as the foundational setting. Additional sections will be added in future phases.

---

### 4. Settings Page Layout/Design System
This task does NOT create a generalized settings page layout component.

**Rationale**: Only one settings section exists currently. Extract layout component when 3+ sections are added.

**Future Enhancement**: Create `SettingsLayout` and `SettingsSection` components for consistent styling.

---

### 5. Settings History/Audit Log
This page does NOT show a history of preference changes (who changed what, when).

**Rationale**: Not required for Epic 5 MVP. The API's `updated_at` timestamp provides basic change tracking.

**Future Enhancement**: Add settings history panel if audit requirements emerge.

---

### 6. Mobile-Specific Settings UI
This page uses the same UI for desktop and mobile (responsive design, not mobile-specific).

**Rationale**: Settings page is simple enough that responsive design suffices. Mobile-specific UI not justified.

---

## Notes

### AccountId Source
The page uses `currentAccount?.id` from AuthContext:
```typescript
const { currentAccount } = useAuth();
const accountId = currentAccount?.id;
```

**AuthContext Interface** (line ~790):
```typescript
interface AuthContextType {
  currentAccount: Account | null;
  // ...
}
```

This is already available and populated in the Dashboard2 layout.

### Navigation Order
Settings appears as the **last item** in navigation:
1. Dashboard
2. Items
3. Guides (Instructions)
4. Properties
5. **Settings** ← New

**Rationale**: Least frequently accessed, should not disrupt primary workflows.

### Future Extensibility
The settings page is designed for easy extension:

```typescript
<div className="space-y-8">
  {/* Language Preference Section */}
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <LanguagePreferenceSection {...props} />
  </div>

  {/* Future sections can be added here */}
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <NotificationPreferenceSection {...props} />
  </div>
</div>
```

Each section is in a white card with consistent styling.

### Language Code Consistency
Uses ISO 639-1 codes: `en`, `fr`, `es`, `de`, `nl`, `it` (Italian, NOT Portuguese).
Source: `/src/lib/i18n/config.ts:19`.

---

## Estimated Effort

**Total**: 7-10 hours

**Breakdown**:
- Step 1 (Create settings page): 2-3 hours
- Step 2 (Add navigation link): 15 minutes
- Step 3 (Add translation keys): 1 hour
- Step 4 (Route protection): 0 hours (already handled)
- Step 5 (Integration tests): 2-3 hours
- Step 6 (Manual testing): 1-2 hours
- Step 7 (Documentation): 30 minutes (optional)

**Confidence Level**: High - Standard page integration with clear requirements.

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ Account Settings page created at `/dashboard2/settings`
2. ✅ Page includes LanguagePreferenceSection component
3. ✅ Current language preference fetched from API on page load
4. ✅ Language selector pre-populated with user's current preference
5. ✅ Saving new preference calls PUT /api/accounts/[accountId]/preferences
6. ✅ Success/error feedback displays correctly after save attempt
7. ✅ Loading state displays while fetching initial preferences
8. ✅ Navigation link to Settings page added to dashboard
9. ✅ Translation keys added for settings page in all 6 locales
10. ✅ Page protected by authentication (redirects to login if not authenticated)
11. ✅ AuthContext provides accountId needed for API calls
12. ✅ No TypeScript compilation errors
13. ✅ No ESLint warnings
14. ✅ Page follows existing dashboard styling patterns
15. ✅ Mobile-responsive layout maintained
16. ✅ All integration tests pass
17. ✅ Manual QA scenarios complete successfully

---

**Document Status**: PENDING
**Last Updated**: 2026-01-22 20:29
**Author**: Technical Lead
**Review Status**: Awaiting Implementation
