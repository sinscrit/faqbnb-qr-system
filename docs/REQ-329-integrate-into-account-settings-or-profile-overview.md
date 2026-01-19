# REQ-329: Integrate Language Preference Section into Account Settings

**Last Modified:** 2026-01-18 12:00:00 UTC
**Request Type:** ENHANCEMENT
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.3
**Size:** M (Medium)
**Priority:** P2
**Dependencies:** REQ-327 (LanguagePreferenceSection component), REQ-328 (Account preference API endpoint)

---

## Overview

This request integrates the LanguagePreferenceSection component into the application's settings interface, allowing property owners and account administrators to access and configure their preferred interface language. The component must be pre-populated with the current saved preference and positioned appropriately within the settings navigation structure.

### Problem Statement

The LanguagePreferenceSection component has been created (REQ-327) but is not integrated into any settings interface where users can access it. Users have no discoverable path to configure their preferred interface language within the application's existing settings navigation structure.

### Solution Summary

1. Create a new Account Settings page at `/dashboard2/settings/account/page.tsx`
2. Add a "Settings" navigation item to the dashboard navigation
3. Integrate the LanguagePreferenceSection component into the account settings page
4. Pre-populate the language dropdown with the current saved preference from the account's `preferred_language` field
5. Maintain visual consistency with existing dashboard patterns

---

## Technical Context

### Existing Architecture

| Component | Location | Relevance |
|-----------|----------|-----------|
| Dashboard Layout | `/src/app/dashboard2/layout.tsx` | Navigation integration point |
| AuthContext | `/src/contexts/AuthContext.tsx` | User/account data provider |
| Database Types | `/src/lib/supabase.ts` | Account schema with `preferred_language` field |
| Section Pattern | `/src/components/SimpleDashboard/PropertySection.tsx` | UI section pattern to follow |

### Database Schema Reference

The `accounts` table already includes the `preferred_language` column (REQ-225):

```typescript
accounts: {
  Row: {
    id: string
    name: string
    owner_id: string
    preferred_language: string | null  // REQ-225
    // ... other fields
  }
}
```

The `users` table also has `preferred_language` for user-level preference:

```typescript
users: {
  Row: {
    id: string
    email: string
    preferred_language: string | null  // REQ-225
    // ... other fields
  }
}
```

### Supported Languages (From PRD)

| Language | Code | Native Name |
|----------|------|-------------|
| English | `en` | English |
| French | `fr` | Français |
| Spanish | `es` | Español |
| German | `de` | Deutsch |
| Dutch | `nl` | Nederlands |
| Italian | `it` | Italiano |

### Design System Colors (Airbnb Design Language)

| Purpose | Color | CSS Class |
|---------|-------|-----------|
| Primary Text | #222222 | `text-[#222222]` |
| Secondary Text | #717171 | `text-[#717171]` |
| Light Background | #F7F7F7 | `bg-[#F7F7F7]` |
| Border | #DDDDDD | `border-[#DDDDDD]` |
| Accent (Red) | #FF385C | `text-[#FF385C]`, `bg-[#FF385C]` |

---

## Architecture Decision: Account Settings vs User Profile

### Analysis

**Option 1: Account Settings (Recommended)**
- Language preference at the account level affects all users associated with that account
- Account administrators set the default language for the account's interface
- Aligns with multi-tenant architecture where accounts are the primary organizational unit
- Database schema has `accounts.preferred_language` as the primary preference storage

**Option 2: User Profile**
- Language preference is personal to each individual user
- Each user within an account could have a different interface language
- Database schema also has `users.preferred_language` for user-level preference

### Decision

**Use Account Settings** with the following rationale:
1. The FAQBNB application is primarily account-focused (multi-tenant)
2. Property owners manage content at the account level
3. The `currentAccount` is already available via `AuthContext`
4. REQ-328 specifies an account preference API endpoint (`/api/accounts/[accountId]/preferences`)
5. Future enhancement can add user-level override in profile settings

---

## Component Structure

### New Files to Create

```
/src/app/dashboard2/settings/
├── page.tsx                              # Settings hub (redirects to account)
└── account/
    └── page.tsx                          # Account settings page

/src/components/TranslationManagement/
├── LanguagePreference/
│   ├── index.ts                          # Exports
│   └── LanguagePreferenceSection.tsx     # Main component (REQ-327)
```

### Modified Files

| File | Changes |
|------|---------|
| `/src/app/dashboard2/layout.tsx` | Add "Settings" navigation item |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Account Settings Page                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Page mounts                                                  │
│     └── useAuth() → currentAccount.preferred_language            │
│                                                                  │
│  2. LanguagePreferenceSection renders                           │
│     └── Pre-populates dropdown with currentAccount preference    │
│                                                                  │
│  3. User selects new language                                    │
│     └── onChange → enables Save button                           │
│                                                                  │
│  4. User clicks Save                                             │
│     └── PUT /api/accounts/{accountId}/preferences                │
│         └── Updates accounts.preferred_language                  │
│             └── Returns updated account                          │
│                 └── refreshAccountContext()                      │
│                     └── UI updates with confirmation             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Task 1: Create Account Settings Page

**File:** `/src/app/dashboard2/settings/account/page.tsx`

Create a new page that:
- Is protected by authentication (uses existing dashboard layout)
- Fetches current account data from `AuthContext`
- Renders the account name and settings sections
- Includes the `LanguagePreferenceSection` component
- Handles loading and error states

**Component Structure:**
```tsx
'use client';

export default function AccountSettingsPage() {
  const { currentAccount, refreshAccountContext } = useAuth();

  // Loading state while account data is being fetched
  // Error state if no current account

  return (
    <div className="space-y-6">
      <header>
        <h1>Account Settings</h1>
        <p>Manage settings for {currentAccount?.name}</p>
      </header>

      <LanguagePreferenceSection
        currentLanguage={currentAccount?.preferred_language || 'en'}
        accountId={currentAccount?.id}
        onSaveSuccess={refreshAccountContext}
      />
    </div>
  );
}
```

### Task 2: Create LanguagePreferenceSection Component

**File:** `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`

Create the component per REQ-327 specification:
- Language dropdown with all 6 supported languages
- Each option shows flag icon, native name, and localized label
- Pre-populated with current preference
- Save button with loading state
- Success/error feedback messages
- Help text explaining the setting

**Props Interface:**
```typescript
interface LanguagePreferenceSectionProps {
  /** Current saved language preference */
  currentLanguage: string | null;
  /** Account ID for API calls */
  accountId: string;
  /** Callback after successful save */
  onSaveSuccess?: () => void;
}
```

### Task 3: Create Settings Index Page (Optional Redirect)

**File:** `/src/app/dashboard2/settings/page.tsx`

Create a settings hub that redirects to account settings:
```tsx
import { redirect } from 'next/navigation';

export default function SettingsPage() {
  redirect('/dashboard2/settings/account');
}
```

### Task 4: Add Settings Navigation Item

**File:** `/src/app/dashboard2/layout.tsx`

Add a "Settings" navigation item to the dashboard navigation:

```typescript
const navigationItems: NavItem[] = [
  // ... existing items
  {
    name: 'Settings',
    mobileLabel: 'Set.',
    href: '/dashboard2/settings',
    icon: Settings,  // from lucide-react
  },
];
```

### Task 5: Create Barrel Export

**File:** `/src/components/TranslationManagement/LanguagePreference/index.ts`

```typescript
export { LanguagePreferenceSection } from './LanguagePreferenceSection';
export type { LanguagePreferenceSectionProps } from './LanguagePreferenceSection';
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/dashboard2/settings/page.tsx` | Settings hub/redirect page |
| `/src/app/dashboard2/settings/account/page.tsx` | Account settings page |
| `/src/components/TranslationManagement/LanguagePreference/index.ts` | Barrel exports |
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Main component |

### Files to Modify

| File Path | Section/Function | Change Description |
|-----------|------------------|-------------------|
| `/src/app/dashboard2/layout.tsx` | `navigationItems` array (lines 42-67) | Add "Settings" navigation item |

### Functions/Components to Reference (Read-Only)

| File | Function/Component | Purpose |
|------|-------------------|---------|
| `/src/contexts/AuthContext.tsx` | `useAuth()` hook | Access `currentAccount`, `refreshAccountContext` |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Component | Section UI pattern reference |
| `/src/lib/supabase.ts` | `Database` types | Account schema reference |

---

## API Integration

### Endpoint (From REQ-328)

```
PUT /api/accounts/{accountId}/preferences
```

**Request Body:**
```json
{
  "preferred_language": "fr"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "account-uuid",
    "name": "Account Name",
    "preferred_language": "fr",
    // ... other account fields
  }
}
```

**Error Responses:**
- `401`: Unauthorized (user not authenticated)
- `403`: Forbidden (user lacks admin access to account)
- `400`: Invalid language code
- `404`: Account not found

---

## Acceptance Criteria

- [ ] Determine whether language preference belongs in account settings or user profile based on application architecture (**Decision: Account Settings**)
- [ ] Import LanguagePreferenceSection component into the appropriate settings page file
- [ ] Position the section in a logical location within the settings page layout
- [ ] Section groups appropriately with other preference or personalization settings
- [ ] Settings page fetches current language preference when loading
- [ ] LanguagePreferenceSection receives current preference value as prop or through context
- [ ] Dropdown displays the currently saved preference when section renders
- [ ] If no preference exists, dropdown displays the system default language (English)
- [ ] Section styling is consistent with other sections on the settings page
- [ ] Section maintains responsive layout on tablet and desktop viewports
- [ ] Section is keyboard accessible within the settings page tab order
- [ ] Settings page handles loading states during preference data fetch
- [ ] Settings page handles error states if preference data cannot be retrieved
- [ ] Preference changes made in the section persist correctly to the backend
- [ ] Navigation to settings page is accessible from main application navigation

---

## UI Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│ FAQBNB Logo    [Property Dropdown]                    [Logout]  │
├─────────────────────────────────────────────────────────────────┤
│ Dashboard │ Items │ Guides │ Properties │ Settings              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Account Settings                                               │
│  Manage settings for [Account Name]                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Interface Language                                          ││
│  │                                                             ││
│  │ Select your preferred language for the application         ││
│  │ interface. This affects menus, labels, and messages.       ││
│  │                                                             ││
│  │ ┌─────────────────────────────────────────────┐             ││
│  │ │ 🇺🇸 English                               ▼│             ││
│  │ └─────────────────────────────────────────────┘             ││
│  │                                                             ││
│  │ ┌──────────────────┐                                        ││
│  │ │  Save Changes    │  (disabled until selection changes)   ││
│  │ └──────────────────┘                                        ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Testing Considerations

### Manual Testing Scenarios

1. **Access Settings Page**
   - Navigate to Settings from dashboard navigation
   - Verify page loads without errors
   - Verify current account name is displayed

2. **Pre-populated Language**
   - If account has `preferred_language` set, dropdown shows that language
   - If `preferred_language` is null, dropdown shows English (default)

3. **Change Language**
   - Select a different language from dropdown
   - Verify Save button becomes enabled
   - Click Save and verify loading state
   - Verify success message appears
   - Verify account context is refreshed

4. **Error Handling**
   - Test with network disconnected
   - Test with invalid session (401)
   - Test with non-admin user (403)

5. **Responsive Design**
   - Test on tablet viewport (768px)
   - Test on desktop viewport (1024px+)
   - Verify layout adapts appropriately

### Accessibility Testing

- Keyboard navigation through dropdown and save button
- Screen reader announces language options
- Focus management after save operation
- ARIA labels on all interactive elements

---

## Dependencies

### Required Before Implementation

| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-225: Language preference columns | ✅ Complete | `accounts.preferred_language` exists |
| REQ-327: LanguagePreferenceSection component | ⏳ In Progress | This task creates it |
| REQ-328: Account preference API endpoint | ⏳ In Progress | API endpoint for saving |

### Will Enable

| Dependent Feature | Description |
|-------------------|-------------|
| REQ-327 completion | Provides integration point for the component |
| Future i18n integration | Language preference informs UI language selection |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API endpoint not ready (REQ-328) | Medium | High | Can stub API initially, implement full integration when ready |
| Account context missing `preferred_language` | Low | Medium | Type definitions already include field; fallback to 'en' |
| Navigation breaks on mobile | Low | Medium | Follow existing mobile patterns, test thoroughly |
| User confused about account vs user settings | Medium | Low | Clear labeling and help text explaining scope |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Source:** `/docs/gen_requests_epic5.md` - REQ-329
- **Related Requests:** REQ-327, REQ-328
- **Epic PRD:** PRD_L10N_Epic5_Owner_Translation_Management.md
- **Dashboard Layout Pattern:** `/src/app/dashboard2/layout.tsx`
- **Section Component Pattern:** `/src/components/SimpleDashboard/PropertySection.tsx`

---

*Generated by Tech Lead Agent for FAQBNB Localization Epic 5*
