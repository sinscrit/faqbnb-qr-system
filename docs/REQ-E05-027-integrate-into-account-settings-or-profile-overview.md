# REQ-E05-027: Integrate Language Preference Section into Account Settings

**Generated:** 2026-01-20 22:45 UTC
**Last Modified:** 2026-01-20 22:45 UTC
**Request Source:** docs/gen_requests_epic5.md - Request #27 (REQ-E05-028)
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.3

---

## Summary

This task integrates the LanguagePreferenceSection component into the account settings interface, enabling property owners to configure their preferred dashboard language as part of their standard profile configuration. Since no dedicated account settings page currently exists in the dashboard, this task also involves creating the account settings page route and infrastructure.

## Current State Analysis

### Existing Infrastructure

1. **No Account Settings Page Exists**
   - Path `/dashboard2/settings` or `/dashboard2/account` does not exist
   - The dashboard navigation (`/src/app/dashboard2/layout.tsx`) has no Settings nav item
   - User logout is available in the header, but no profile/settings access

2. **LanguagePreferenceSection Component**
   - Expected at: `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx`
   - Must be created as part of REQ-E05-026 (prerequisite)
   - Component handles language selection dropdown, save button, loading states

3. **Account Preferences API Endpoint**
   - Expected at: `/src/app/api/accounts/[accountId]/preferences/route.ts`
   - Must be created as part of REQ-E05-027 (prerequisite)
   - PUT endpoint for persisting preferredLanguage

4. **LocaleContext Already Exists**
   - Location: `/src/contexts/LocaleContext.tsx`
   - Supports 6 languages: en, es, fr, de, it, nl (not pt)
   - Has persistence to database via `/api/user/language` endpoint
   - Already integrated with AuthContext for user preference detection

5. **Dashboard Layout Structure**
   - Location: `/src/app/dashboard2/layout.tsx`
   - Navigation items: Dashboard, Items, Guides, Properties
   - No Settings navigation item currently exists
   - Pink accent color: `#FF385C` (Airbnb brand)

### Existing Patterns to Follow

| Pattern | Location | Usage |
|---------|----------|-------|
| Page Layout | `/src/app/dashboard2/help/page.tsx` | Card-based content sections with expandable areas |
| Modal Settings | `/src/components/SimpleDashboard/DashboardSettingsPopover.tsx` | Toggle switches, section groupings |
| Navigation | `/src/app/dashboard2/layout.tsx` | NavItem interface with icons |
| Auth Protection | `/src/app/dashboard2/help/page.tsx` | Loading, auth check, permissions check pattern |
| Card Styling | Dashboard components | `bg-white rounded-xl shadow-sm border border-gray-200` |

---

## Implementation Approach

### Approach Decision: Create New Account Settings Page

Since no account settings page exists, we will:
1. Create a new `/dashboard2/account` route for account settings
2. Add a Settings navigation item to the dashboard layout
3. Integrate LanguagePreferenceSection as the first settings section
4. Structure the page to accommodate future settings sections

### Alternative Considered: Add to Help Page
- Rejected: Help page is for documentation, not configuration
- Would confuse users looking for account customization

### Alternative Considered: Modal/Popover Only
- Rejected: Not discoverable, doesn't scale for additional settings
- Better to have dedicated settings page for future expansion

---

## Detailed Implementation Tasks

### Task 1: Create Account Settings Page

**File:** `/src/app/dashboard2/account/page.tsx`

**Description:** Create the main account settings page with section-based layout

**Implementation Details:**
```typescript
// Page structure follows help page pattern
// Sections: Language Preference, Account Info (future), Preferences (future)
```

**Key Requirements:**
- Use 'use client' directive for client-side interactivity
- Follow help page auth/permission check pattern
- Include loading skeleton during data fetch
- Display current user and account context information
- Organize settings in collapsible card sections
- Pre-populate language dropdown with current preference

### Task 2: Add Settings Navigation Item

**File:** `/src/app/dashboard2/layout.tsx` (modify)

**Description:** Add "Account" or "Settings" navigation item to dashboard nav

**Changes Required:**
1. Import Settings icon from lucide-react
2. Add new NavItem to navigationItems array:
```typescript
{
  name: 'Account',
  mobileLabel: 'Acct.',
  href: '/dashboard2/account',
  icon: Settings,
}
```
3. Position after Properties (or as last item)

### Task 3: Integrate LanguagePreferenceSection

**File:** `/src/app/dashboard2/account/page.tsx`

**Description:** Import and render LanguagePreferenceSection within the account page

**Integration Pattern:**
```tsx
<section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <Languages className="w-5 h-5 text-[#FF385C]" />
    Language Preference
  </h2>
  <LanguagePreferenceSection
    accountId={currentAccount?.id}
    currentLanguage={locale}
    onLanguageChange={handleLanguageChange}
  />
</section>
```

### Task 4: Fetch and Pre-populate Current Preference

**Implementation Details:**
- Use LocaleContext's `locale` for current value
- On page load, language dropdown shows current setting
- If user has no preference stored, default to 'en'
- Handle null/undefined currentAccount gracefully

### Task 5: Handle Save and Immediate Effect

**Description:** When language preference is saved, apply changes immediately

**Flow:**
1. User selects new language from dropdown
2. User clicks Save button
3. LanguagePreferenceSection calls API endpoint
4. On success, call LocaleContext's setLocale to update app state
5. UI updates to reflect new language immediately
6. Show success toast notification

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/dashboard2/account/page.tsx` | Main account settings page |
| `/src/app/dashboard2/account/layout.tsx` | Optional: Page-specific layout if needed |

### Files to Modify

| File Path | Changes Required |
|-----------|------------------|
| `/src/app/dashboard2/layout.tsx` | Add "Account" navigation item with Settings icon |

### Components to Import (Prerequisites - Must Exist)

| Component | Expected Location | Status |
|-----------|-------------------|--------|
| LanguagePreferenceSection | `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | From REQ-E05-026 |

### Hooks and Contexts to Use

| Hook/Context | Location | Usage |
|--------------|----------|-------|
| useAuth | `/src/contexts/AuthContext` | Get user, currentAccount |
| useLocale | `/src/contexts/LocaleContext` | Get current locale, setLocale |
| usePermissions | `/src/hooks/usePermissions` | Permission checks |

---

## Component Structure

### Account Settings Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Account Settings                                             │
│ Manage your account preferences and settings                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🌐 Language Preference                              [▼]     │ │
│ │─────────────────────────────────────────────────────────────│ │
│ │                                                             │ │
│ │  Dashboard Language:  [English ▼]                           │ │
│ │                                                             │ │
│ │  ℹ️ This setting controls your dashboard interface          │ │
│ │     language. Content translations are managed separately.  │ │
│ │                                                             │ │
│ │                                    [Save Preference]        │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 👤 Account Information                              [▼]     │ │
│ │─────────────────────────────────────────────────────────────│ │
│ │  Account Name: [Current Account Name]                       │ │
│ │  Email: [user@example.com]                                  │ │
│ │  Role: [Owner/Admin/Member]                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Updated Navigation Structure

```
Dashboard Navigation (after modification):
┌───────────────────────────────────────────────────────────────┐
│ Dashboard │ Items │ Guides │ Properties │ Account            │
│    🏠     │  📦   │  📄    │    🏢      │   ⚙️               │
└───────────────────────────────────────────────────────────────┘
```

---

## Props and Interfaces

### LanguagePreferenceSection Props (Expected)

```typescript
interface LanguagePreferenceSectionProps {
  /** Account ID for API persistence */
  accountId: string | undefined;
  /** Current language setting (ISO 639-1 code) */
  currentLanguage?: SupportedLanguage;
  /** Callback when language is successfully changed */
  onLanguageChange?: (language: SupportedLanguage) => void;
}
```

### Page Component Interface

```typescript
// Account page needs access to:
interface AccountPageContext {
  user: AuthUser | null;
  currentAccount: Account | null;
  locale: SupportedLanguage;
  setLocale: (locale: SupportedLanguage) => Promise<LocaleChangeResult>;
}
```

---

## Dependencies

### Prerequisite Tasks (Must Complete First)

| Task | Status | Blocking |
|------|--------|----------|
| REQ-E05-026: LanguagePreferenceSection Component | Pending | Yes |
| REQ-E05-027: Account Preference API Endpoint | Pending | Yes |

### Existing Dependencies (Already Available)

| Dependency | Location | Status |
|------------|----------|--------|
| LocaleContext | `/src/contexts/LocaleContext.tsx` | ✅ Available |
| AuthContext | `/src/contexts/AuthContext.tsx` | ✅ Available |
| usePermissions | `/src/hooks/usePermissions.ts` | ✅ Available |
| Lucide Icons | `lucide-react` | ✅ Available |

---

## Acceptance Criteria Verification

| Criteria | Implementation | Task |
|----------|----------------|------|
| LanguagePreferenceSection component is imported into account settings page | Import in account/page.tsx | Task 3 |
| Component renders within settings page layout in appropriate section grouping | Rendered in card section | Task 3 |
| Component displays under "Preferences" or "Regional Settings" section heading | Header with Languages icon | Task 3 |
| Component appears before or after related settings like timezone or date format preferences | Only language for now, structured for expansion | Task 1 |
| Component receives authenticated user's account ID as required prop | Pass currentAccount.id | Task 3 |
| Component pre-populates dropdown with current language preference from account data | Use LocaleContext locale | Task 4 |
| Settings page displays loading state while fetching account preferences | Loading spinner pattern | Task 1 |
| Settings page handles missing preferences gracefully with default language selection | Default to 'en' | Task 4 |
| Component save operation integrates with account preferences API endpoint | Via LanguagePreferenceSection | Task 5 |
| Success notification displays within settings page context after preference save | Toast notification | Task 5 |
| Error handling displays appropriate messages within settings page layout | Error state handling | Task 1 |
| Settings page layout does not shift or reflow when language preference changes | Fixed-height sections | Task 1 |
| Component maintains consistent styling with other settings section components | Tailwind card pattern | Task 1 |
| Component spacing and padding matches other settings sections | Consistent p-6 padding | Task 1 |
| Integration preserves existing settings page functionality without regressions | N/A - new page | Task 1 |
| Settings page remains responsive with language preference section added | Responsive classes | Task 1 |
| Component displays correctly in both light and dark theme contexts if themes are supported | Current theme only | Task 1 |
| Keyboard navigation flows logically through settings controls including language preference | Tab order | Task 1 |
| ARIA labels and semantic structure maintain accessibility standards across entire settings page | aria-labels | Task 1 |
| Integration can be toggled via feature flag for gradual rollout if needed | Not required | N/A |
| Alternative integration location in user profile page is considered if more appropriate than settings | Decision: Account page | Approach |

---

## Technical Notes

### Language Code Alignment

The LocaleContext uses these language codes:
- 'en', 'fr', 'es', 'de', 'nl', 'it'

The PRD specifies:
- 'en', 'es', 'fr', 'de', 'it', 'pt'

**Note:** There's a discrepancy - LocaleContext has 'nl' (Dutch) but PRD mentions 'pt' (Portuguese). The implementation should align with LocaleContext's existing configuration to avoid breaking changes.

### API Endpoint Integration

The LocaleContext already has a database persistence mechanism via `/api/user/language`. The new account preferences endpoint at `/api/accounts/[accountId]/preferences` should either:
1. Use the existing user language endpoint for backward compatibility
2. Or update both user and account preferences for consistency

Recommendation: Use existing `/api/user/language` endpoint since LocaleContext already handles this.

### Error Handling

The account settings page should handle:
1. Missing account context (user without account)
2. API save failures with retry option
3. Network errors with appropriate messaging
4. Permission denied scenarios

---

## Testing Considerations

### Manual Testing Scenarios

1. **First-time user** - No preference set, should show 'en' default
2. **Existing preference** - Should pre-populate with stored value
3. **Language change** - Select new language, save, verify immediate UI update
4. **Save failure** - Disconnect network, attempt save, verify error handling
5. **Multiple tabs** - Change language in one tab, verify sync in other tabs
6. **Mobile viewport** - Verify responsive layout on small screens
7. **Keyboard navigation** - Tab through all controls, verify logical order

### Accessibility Testing

1. Screen reader announces section headers
2. Dropdown is keyboard accessible
3. Save button state changes are announced
4. Error messages are accessible

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LanguagePreferenceSection component not ready | Medium | High | This task depends on REQ-E05-026; ensure it's complete first |
| API endpoint not ready | Medium | High | This task depends on REQ-E05-027; ensure it's complete first |
| LocaleContext mismatch with new component | Low | Medium | Use existing LocaleContext integration patterns |
| Navigation addition breaks layout | Low | Low | Test on mobile and desktop viewports |

---

## References

- PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Definition: `/docs/gen_requests_epic5.md` (REQ-E05-028)
- LocaleContext: `/src/contexts/LocaleContext.tsx`
- Dashboard Layout: `/src/app/dashboard2/layout.tsx`
- Help Page Pattern: `/src/app/dashboard2/help/page.tsx`

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
*Phase 6, Task 6.3: Integrate into account settings (or profile)*
