# Implementation Overview: Update Account Settings Components

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-014 |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | Not specified |
| Breakdown Created | 2026-01-22 21:03 |
| Sub-Epic | 2G - Settings & Account |
| Task | 2G.2 |
| T-shirt Size | Medium |
| Estimated Effort | 8-12 hours |
| Status | PENDING |

---

## Executive Summary

This task implements internationalization for account settings components in the FAQBNB application. The work involves creating new account settings UI components that use the `settings.account.*` namespace established in Task 2G.1 (REQ-E02-013). Currently, the application has NO dedicated account settings page or components - only basic user info display in the header (email, role badge, logout button) and backend account management APIs.

**Current State:**
- No account settings page exists in `/src/app/user/` or `/src/app/dashboard2/`
- User layout header shows: email address, role badge (Admin/User), and logout button (all hardcoded strings)
- Backend APIs exist for account management (`/src/app/api/admin/accounts/`)
- AuthContext provides account-related functionality (useAccountContext hook)
- `settings.account.*` namespace with 20 translation keys ready to use (created in Task 2G.1)

**Target State:**
- New account settings page at `/src/app/user/account/page.tsx`
- Account settings form component using `settings.account.*` translations
- Display current email, account creation date, last login
- Email change functionality (UI only - API integration future work)
- Password change functionality (UI only - API integration future work)
- Account deletion functionality (UI only - API integration future work)
- Update user layout header strings to use translations
- Update logout button to use translations

**Scope:**
- ~20 translation keys from `settings.account.*` namespace
- Create 1 new page component
- Create 1-2 new form/section components
- Update header in user layout (4-5 hardcoded strings)
- Client-side components using `useTranslations('settings.account')`

**Out of Scope:**
- Backend API implementation for email/password changes (future work)
- Actual account deletion logic (future work)
- Email verification flows (future work)
- Two-factor authentication (handled in Task 2G.4 - Security settings)
- Active session management (handled in Task 2G.4 - Security settings)

---

## Goals

### Primary Objectives

1. **Create Account Settings Page**
   - New page at `/src/app/user/account/page.tsx`
   - Display account information (email, creation date, last login)
   - Form sections for email change, password change, account deletion
   - Use `settings.account.*` translations throughout
   - Client-side component with `'use client'` directive

2. **Internationalize User Layout Header**
   - Update role badge text: "Admin" / "User" → `settings.account.roleAdmin` / `settings.account.roleUser` (or use existing `common.*`)
   - Update logout button: "Logout" → translation key
   - Maintain existing functionality and styling

3. **Create Reusable Account Settings Components**
   - `AccountInfoSection` - Display email, account dates
   - `EmailChangeSection` - Form for changing email
   - `PasswordChangeSection` - Form for changing password
   - `AccountDeletionSection` - Danger zone for account deletion

4. **Ensure Accessibility**
   - Use all provided aria-label translation keys
   - Proper form labels and field associations
   - Screen reader friendly navigation

### Success Criteria

- ✅ Account settings page accessible at `/user/account`
- ✅ All visible strings use translations from `settings.account.*`
- ✅ Forms validate inputs (client-side only for now)
- ✅ Warning messages displayed for destructive actions (delete account)
- ✅ User layout header uses translations
- ✅ No hardcoded English strings remain in updated components
- ✅ All interactive elements have proper aria-labels
- ✅ TypeScript compilation succeeds with no errors

---

## Technical Context

### Translation Namespace: `settings.account`

Available keys (from `/messages/en.json` lines 3385-3407):

```json
{
  "settings": {
    "account": {
      "title": "Account Settings",
      "subtitle": "Manage your account information and preferences",
      "email": "Email Address",
      "emailDescription": "Your account email address",
      "emailInputAriaLabel": "Email address input field",
      "changeEmail": "Change Email",
      "changeEmailButtonAriaLabel": "Change email address",
      "emailUpdated": "Email updated to {email}",
      "currentPassword": "Current Password",
      "newPassword": "New Password",
      "confirmPassword": "Confirm Password",
      "changePassword": "Change Password",
      "passwordUpdated": "Password updated successfully",
      "deleteAccount": "Delete Account",
      "deleteAccountButtonAriaLabel": "Delete account permanently",
      "deleteWarning": "This action is permanent and cannot be undone.",
      "deleteConfirmation": "Are you sure you want to delete your account?",
      "sessionsActive": "{count, plural, one {# active session} other {# active sessions}}",
      "lastLogin": "Last login: {date} at {time}",
      "accountCreated": "Account created: {date}",
      "manageSubscription": "Manage Subscription"
    }
  }
}
```

### Current User Layout Implementation

**File:** `/src/app/user/layout.tsx` (258 lines)

**Hardcoded Strings to Replace:**
- Line 187: `"FAQBNB Dashboard"` - Page title
- Line 192: `"👑 Admin"` / `"👤 User"` - Role badges
- Line 204: `"Logout"` - Logout button

**Current Structure:**
```tsx
// Lines 188-196: User info display
<div className="flex items-center space-x-2 mt-1">
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
    {isAdmin ? '👑 Admin' : '👤 User'}
  </span>
  <span className="text-sm text-gray-600">{user?.email}</span>
</div>

// Lines 200-205: Logout button
<button onClick={() => signOut()}>
  Logout
</button>
```

**Navigation Items (Lines 92-99):**
```tsx
const navigationItems = [
  { name: 'Dashboard', href: '/user', icon: '📊' },
  { name: 'Items', href: '/user/items', icon: '📦' },
  { name: 'Properties', href: '/user/properties', icon: '🏠' },
  { name: 'Analytics', href: '/user/analytics', icon: '📈' },
  // Need to add: Account settings
];
```

### Authentication Context

**File:** `/src/contexts/AuthContext.tsx`

**Available Data:**
- `user` - Current user object with email, role
- `user.email` - User email address
- `user.created_at` - Account creation timestamp
- `user.last_sign_in_at` - Last login timestamp
- `isAdmin` - Boolean for admin role
- `signOut()` - Logout function
- `currentAccount` - Current account object
- `userAccounts` - List of user's accounts

**Hook Usage:**
```tsx
const { user, isAdmin, signOut } = useAuth();
const { currentAccount, userAccounts } = useAccountContext();
```

### Component Patterns to Follow

**Pattern 1: Page Component with useTranslations**
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function AccountSettingsPage() {
  const t = useTranslations('settings.account');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      {/* Content */}
    </div>
  );
}
```

**Pattern 2: Form Component with Multiple Translation Scopes**
```tsx
'use client';
import { useTranslations } from 'next-intl';

export function EmailChangeSection() {
  const t = useTranslations('settings.account');
  const tCommon = useTranslations('common');

  return (
    <form>
      <label htmlFor="email">{t('email')}</label>
      <input
        id="email"
        aria-label={t('emailInputAriaLabel')}
        // ...
      />
      <button aria-label={t('changeEmailButtonAriaLabel')}>
        {t('changeEmail')}
      </button>
    </form>
  );
}
```

**Pattern 3: ICU Message Format for Dynamic Content**
```tsx
// For dates
<p>{t('lastLogin', { date: formatDate(user.last_sign_in_at), time: formatTime(user.last_sign_in_at) })}</p>
<p>{t('accountCreated', { date: formatDate(user.created_at) })}</p>

// For email updates
setSuccessMessage(t('emailUpdated', { email: newEmail }));
```

### Existing Translation Patterns

From other components (e.g., PropertyForm, PropertiesPage):

```tsx
// Multiple translation scopes
const t = useTranslations('settings.account');
const tActions = useTranslations('common.actions'); // For Save, Cancel, etc.
const tErrors = useTranslations('common.errors'); // For error messages

// Success notifications
setSuccessMessage(t('passwordUpdated'));
setSuccessMessage(t('emailUpdated', { email: newEmail }));

// Form validation
errors.email = t('emailRequired');
errors.password = t('passwordTooShort');
```

---

## Implementation Plan

### Step 1: Create Account Settings Page Component
**Description:** Create the main account settings page at `/src/app/user/account/page.tsx`
**Rationale:** Foundation for all account settings UI, follows existing app structure (`/user/*` pages)
**Estimated Effort:** Medium (2-3 hours)

**Implementation Details:**
- Create new file: `/src/app/user/account/page.tsx`
- Client-side component (`'use client'`)
- Use `useTranslations('settings.account')` hook
- Page structure:
  - Header with title and subtitle
  - Account information section (read-only display)
  - Email change section (form)
  - Password change section (form)
  - Account deletion section (danger zone)
- Import and use `useAuth()` hook for user data
- Use `useState` for form states and success/error messages
- Style with Tailwind CSS (match existing pages like `/user/properties`)

**Key Translations:**
- `t('title')` - Page title
- `t('subtitle')` - Page subtitle
- `t('email')` - Email field label
- `t('emailDescription')` - Email description text

---

### Step 2: Create Account Information Section Component
**Description:** Display user's current account information (email, account creation date, last login)
**Rationale:** Reusable component for showing read-only account data
**Estimated Effort:** Small (1-2 hours)

**Implementation Details:**
- Create component: `AccountInfoSection` within page or separate file
- Display fields:
  - Email address (from `user.email`)
  - Account created date (from `user.created_at`)
  - Last login date/time (from `user.last_sign_in_at`)
- Use ICU format for dates: `t('accountCreated', { date: formattedDate })`
- Use ICU format for last login: `t('lastLogin', { date: formattedDate, time: formattedTime })`
- Style as info card with subtle background

**Date Formatting:**
```tsx
const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString();
};

const formatTime = (isoDate: string) => {
  return new Date(isoDate).toLocaleTimeString();
};
```

**Key Translations:**
- `t('email')` - Email label
- `t('emailDescription')` - Description
- `t('accountCreated', { date })` - Account creation date
- `t('lastLogin', { date, time })` - Last login timestamp

---

### Step 3: Create Email Change Section Component
**Description:** Form for changing user email address
**Rationale:** Core account management feature
**Estimated Effort:** Medium (2 hours)

**Implementation Details:**
- Create component: `EmailChangeSection`
- Form fields:
  - New email input (with validation)
  - Confirm email input (must match)
  - Current password input (for verification)
- Client-side validation:
  - Email format validation
  - Email match validation
  - Required field validation
- Form state management with `useState`
- Submit handler (currently: show success message, no API call)
- Display success/error messages
- Proper aria-labels for all inputs

**Form Structure:**
```tsx
<div>
  <h3>{t('changeEmail')}</h3>
  <form onSubmit={handleEmailChange}>
    <input
      type="email"
      placeholder={t('email')}
      aria-label={t('emailInputAriaLabel')}
    />
    <input
      type="email"
      placeholder="Confirm new email"
    />
    <input
      type="password"
      placeholder={t('currentPassword')}
    />
    <button
      type="submit"
      aria-label={t('changeEmailButtonAriaLabel')}
    >
      {t('changeEmail')}
    </button>
  </form>
  {success && <p>{t('emailUpdated', { email: newEmail })}</p>}
</div>
```

**Key Translations:**
- `t('changeEmail')` - Button text
- `t('changeEmailButtonAriaLabel')` - Button aria-label
- `t('email')` - Email field label
- `t('emailInputAriaLabel')` - Input aria-label
- `t('currentPassword')` - Password field label
- `t('emailUpdated', { email })` - Success message

---

### Step 4: Create Password Change Section Component
**Description:** Form for changing user password
**Rationale:** Essential security feature for account management
**Estimated Effort:** Medium (2 hours)

**Implementation Details:**
- Create component: `PasswordChangeSection`
- Form fields:
  - Current password input
  - New password input
  - Confirm new password input
- Client-side validation:
  - Password strength requirements (min length, etc.)
  - Password match validation
  - Required field validation
- Form state management
- Submit handler (currently: show success message, no API call)
- Display success/error messages
- Show password strength indicator (optional but nice to have)

**Form Structure:**
```tsx
<div>
  <h3>{t('changePassword')}</h3>
  <form onSubmit={handlePasswordChange}>
    <input
      type="password"
      placeholder={t('currentPassword')}
    />
    <input
      type="password"
      placeholder={t('newPassword')}
    />
    <input
      type="password"
      placeholder={t('confirmPassword')}
    />
    <button type="submit">
      {t('changePassword')}
    </button>
  </form>
  {success && <p>{t('passwordUpdated')}</p>}
</div>
```

**Key Translations:**
- `t('changePassword')` - Section title and button
- `t('currentPassword')` - Current password label
- `t('newPassword')` - New password label
- `t('confirmPassword')` - Confirm password label
- `t('passwordUpdated')` - Success message

---

### Step 5: Create Account Deletion Section Component
**Description:** Danger zone for account deletion with confirmation dialog
**Rationale:** Users need ability to delete their account (GDPR compliance)
**Estimated Effort:** Medium (2 hours)

**Implementation Details:**
- Create component: `AccountDeletionSection`
- Visual styling: Red/danger colors to indicate destructive action
- Two-step confirmation:
  1. Click "Delete Account" button
  2. Confirm in modal/dialog with warning text
- Modal/dialog shows:
  - Warning message: `t('deleteWarning')`
  - Confirmation message: `t('deleteConfirmation')`
  - Cancel button
  - Confirm delete button (red/danger style)
- Submit handler (currently: console.log or alert, no API call)
- Consider using existing modal patterns from the codebase

**Component Structure:**
```tsx
<div className="border-2 border-red-200 bg-red-50 rounded-lg p-6">
  <h3 className="text-red-900">{t('deleteAccount')}</h3>
  <p className="text-red-700">{t('deleteWarning')}</p>
  <button
    onClick={() => setShowConfirmDialog(true)}
    aria-label={t('deleteAccountButtonAriaLabel')}
    className="bg-red-600 text-white"
  >
    {t('deleteAccount')}
  </button>

  {showConfirmDialog && (
    <div className="modal">
      <p>{t('deleteConfirmation')}</p>
      <button onClick={handleCancel}>Cancel</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  )}
</div>
```

**Key Translations:**
- `t('deleteAccount')` - Section title and button
- `t('deleteAccountButtonAriaLabel')` - Button aria-label
- `t('deleteWarning')` - Warning text
- `t('deleteConfirmation')` - Confirmation dialog text

---

### Step 6: Update User Layout Header Strings
**Description:** Replace hardcoded strings in user layout header with translations
**Rationale:** Consistent internationalization across all UI elements
**Estimated Effort:** Small (1 hour)

**Implementation Details:**
- Update file: `/src/app/user/layout.tsx`
- Add `useTranslations` hook at top of component
- Replace hardcoded strings:
  - Line 187: "FAQBNB Dashboard" → Use existing or add new key
  - Line 192: "Admin" / "User" → Check for existing common keys or use settings
  - Line 204: "Logout" → Use common.actions or settings key
- Decision needed: Use `common.*` namespace for general UI strings or create specific keys?
- Maintain all existing functionality and styling

**Recommended Approach:**
```tsx
'use client';
import { useTranslations } from 'next-intl';

function UserLayoutContent({ children }: { children: React.ReactNode }) {
  const t = useTranslations('common'); // Or appropriate namespace
  const { user, loading, signOut, isAdmin } = useAuth();

  // Line 192: Role badge
  <span>
    {isAdmin ? t('roles.admin') : t('roles.user')}
    {/* OR use emoji + text: */}
    {isAdmin ? '👑 ' + t('roles.admin') : '👤 ' + t('roles.user')}
  </span>

  // Line 204: Logout button
  <button onClick={() => signOut()}>
    {t('actions.logout')}
  </button>
}
```

**Note:** May need to add keys to `common.*` namespace if they don't exist:
- `common.roles.admin` → "Admin"
- `common.roles.user` → "User"
- `common.actions.logout` → "Logout"

---

### Step 7: Add Account Settings Navigation Link
**Description:** Add "Account" or "Settings" navigation item to user layout
**Rationale:** Users need to discover and access account settings page
**Estimated Effort:** Small (30 minutes)

**Implementation Details:**
- Update file: `/src/app/user/layout.tsx`
- Add navigation item to `navigationItems` array (lines 92-99)
- Insert before or after existing items (suggested: after Analytics, before Admin Panel)
- Use settings icon (⚙️ or similar)
- Label: Use translation key

**Code Change:**
```tsx
const navigationItems = [
  { name: 'Dashboard', href: '/user', icon: '📊' },
  { name: 'Items', href: '/user/items', icon: '📦' },
  { name: 'Properties', href: '/user/properties', icon: '🏠' },
  { name: 'Analytics', href: '/user/analytics', icon: '📈' },
  { name: t('settings.title'), href: '/user/account', icon: '⚙️' }, // NEW
  ...(isAdmin ? [{ name: 'Admin Panel', href: '/admin', icon: '👑' }] : [])
];
```

**Translation Key:**
- Use `settings.title` ("Settings") or `settings.account.title` ("Account Settings")
- Or add `common.navigation.account` if more appropriate

---

### Step 8: Implement Form Validation Helpers
**Description:** Create reusable validation functions for email and password
**Rationale:** Consistent validation across form components
**Estimated Effort:** Small (1 hour)

**Implementation Details:**
- Create file: `/src/lib/account-validation.ts` (or add to existing validation file)
- Email validation function:
  - Check email format (regex)
  - Check required field
  - Return error message key (not translated string)
- Password validation function:
  - Check min length (8+ characters)
  - Check required field
  - Optional: Check strength requirements
  - Return error message key
- Password match validation:
  - Compare password and confirm password
  - Return error message key if mismatch

**Example Implementation:**
```tsx
// /src/lib/account-validation.ts
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return 'emailRequired';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'emailInvalid';
  }

  return null; // Valid
};

export const validatePassword = (password: string): string | null => {
  if (!password || password.trim() === '') {
    return 'passwordRequired';
  }

  if (password.length < 8) {
    return 'passwordTooShort';
  }

  return null; // Valid
};

export const validatePasswordMatch = (password: string, confirm: string): string | null => {
  if (password !== confirm) {
    return 'passwordMismatch';
  }
  return null;
};
```

**Note:** Error message keys should be translated in components using `tErrors('emailRequired')` or similar.

---

### Step 9: Add Loading and Error States
**Description:** Implement proper loading states and error handling for forms
**Rationale:** Better UX and consistent with existing patterns
**Estimated Effort:** Small (1 hour)

**Implementation Details:**
- Add loading state for form submissions: `const [loading, setLoading] = useState(false)`
- Add error state: `const [error, setError] = useState<string | null>(null)`
- Add success state: `const [success, setSuccess] = useState<string | null>(null)`
- Disable form inputs and buttons while loading
- Display error messages with proper styling (red text, alert icon)
- Display success messages with proper styling (green text, check icon)
- Clear messages after timeout (optional)

**Pattern:**
```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    // Validation
    const emailError = validateEmail(newEmail);
    if (emailError) {
      setError(t(`validation.${emailError}`));
      return;
    }

    // API call (future)
    // await updateEmail(newEmail);

    // Success
    setSuccess(t('emailUpdated', { email: newEmail }));
  } catch (err) {
    setError(t('errors.updateFailed'));
  } finally {
    setLoading(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
    <button disabled={loading}>
      {loading ? t('common.actions.saving') : t('changeEmail')}
    </button>
    {error && <div className="text-red-600">{error}</div>}
    {success && <div className="text-green-600">{success}</div>}
  </form>
);
```

---

### Step 10: Testing and Validation
**Description:** Manual testing of all account settings functionality
**Rationale:** Ensure all translations work and UI behaves correctly
**Estimated Effort:** Small (1-2 hours)

**Testing Checklist:**
- [ ] Account settings page loads at `/user/account`
- [ ] All text displays in English (from translations)
- [ ] Account info section shows correct user data
- [ ] Email change form validates inputs
- [ ] Email change form shows success message
- [ ] Password change form validates inputs
- [ ] Password change form shows success message
- [ ] Account deletion shows warning and confirmation
- [ ] Account deletion confirmation dialog works
- [ ] User layout header shows translated strings
- [ ] Logout button works and uses translation
- [ ] Navigation includes "Account" or "Settings" link
- [ ] All aria-labels present and correct
- [ ] No console errors or warnings
- [ ] TypeScript compilation succeeds
- [ ] Page is responsive (mobile, tablet, desktop)

**Translation Validation:**
- [ ] All keys from `settings.account.*` namespace used correctly
- [ ] ICU format works for dates and variables
- [ ] No hardcoded English strings remain
- [ ] Proper fallback for missing translations

**Accessibility Testing:**
- [ ] Tab through all form elements (keyboard navigation)
- [ ] Screen reader announces labels and errors correctly
- [ ] All interactive elements have visible focus states
- [ ] Buttons have descriptive aria-labels

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create

| File | Purpose | Type |
|------|---------|------|
| `/src/app/user/account/page.tsx` | Main account settings page | Create |
| `/src/lib/account-validation.ts` | Email/password validation helpers | Create (optional) |

### Existing Files to Modify

#### User Layout

| File | Lines | Target | Modification |
|------|-------|--------|--------------|
| `/src/app/user/layout.tsx` | 1-20 | Imports | Add `useTranslations` import |
| `/src/app/user/layout.tsx` | 16-243 | `UserLayoutContent` component | Add translation hooks |
| `/src/app/user/layout.tsx` | 92-99 | `navigationItems` array | Add account settings navigation item |
| `/src/app/user/layout.tsx` | 187 | Page title string | Replace with translation |
| `/src/app/user/layout.tsx` | 192 | Role badge strings | Replace with translations |
| `/src/app/user/layout.tsx` | 204 | Logout button string | Replace with translation |

#### Translation Files (Reference Only)

| File | Lines | Purpose | Modification |
|------|-------|---------|--------------|
| `/messages/en.json` | 3385-3407 | Account settings translations | Reference (no changes needed - already created in Task 2G.1) |
| `/messages/fr.json` | ~3385-3407 | French placeholders | Reference (translations in Task 2G.6) |
| `/messages/es.json` | ~3385-3407 | Spanish placeholders | Reference (translations in Task 2G.6) |
| `/messages/de.json` | ~3385-3407 | German placeholders | Reference (translations in Task 2G.6) |
| `/messages/nl.json` | ~3385-3407 | Dutch placeholders | Reference (translations in Task 2G.6) |
| `/messages/it.json` | ~3385-3407 | Italian placeholders | Reference (translations in Task 2G.6) |

**Note:** Translation files may need additional keys added for:
- `common.roles.admin` / `common.roles.user` (if not already present)
- `common.actions.logout` (if not already present)
- Validation error messages (if not in `common.validation.*` or `common.errors.*`)

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-013** (Task 2G.1): Create `settings` namespace structure
  - **Status:** MUST be completed first
  - **Provides:** `settings.account.*` translation keys (~20 keys)
  - **Reason:** Cannot use translations that don't exist yet

- **Epic 1 - L10N Foundation**
  - **Status:** Completed
  - **Provides:** next-intl setup, useTranslations hook, translation file structure
  - **Reason:** Core i18n infrastructure required

### Blocks (Requires This First)

- **REQ-E02-089** (Task 2G.6): Generate translations for 5 non-English languages
  - **Status:** Blocked until this task completes
  - **Reason:** Need to see account settings UI in context before translating
  - **Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

### Parallel Safety

**Files Modified by This Task:**
- `/src/app/user/account/page.tsx` (new file)
- `/src/app/user/layout.tsx` (header strings, navigation)
- `/src/lib/account-validation.ts` (new file - optional)

**Conflicts With:**
- **Task 2G.3** (Update profile components) - Might also create `/src/app/user/profile/page.tsx`
  - **Resolution:** Different page routes, no file conflicts
  - **Safe to parallelize:** YES

- **Task 2G.4** (Update preferences components) - Might also create `/src/app/user/preferences/page.tsx`
  - **Resolution:** Different page routes, no file conflicts
  - **Safe to parallelize:** YES

- **Task 2G.5** (Update help page) - Modifies `/src/app/dashboard2/help/page.tsx`
  - **Resolution:** Different files, no conflicts
  - **Safe to parallelize:** YES

**User Layout Conflict:**
- Tasks 2G.2, 2G.3, 2G.4 all need to update `/src/app/user/layout.tsx` to add navigation items
- **Resolution:** Sequential execution recommended, OR coordinate navigation items in advance
- **Safe to parallelize:** NO (without coordination)

### External Dependencies

- **next-intl library** - Translation hook (`useTranslations`)
- **React hooks** - useState, useEffect (for form state management)
- **AuthContext** - useAuth hook (for user data, signOut function)
- **Tailwind CSS** - Styling framework
- **Next.js App Router** - Page routing

---

## Risks and Considerations

### Potential Side Effects

1. **User Layout Changes**
   - **Risk:** Breaking navigation or header functionality
   - **Mitigation:** Test thoroughly after changes, maintain existing structure
   - **Impact:** Medium

2. **Translation Key Dependencies**
   - **Risk:** Using wrong namespace or non-existent keys
   - **Mitigation:** Reference Task 2G.1 document, verify keys exist in en.json
   - **Impact:** Low (caught during testing)

3. **Form Validation Without Backend**
   - **Risk:** Users expect forms to actually work (change email/password)
   - **Mitigation:** Show clear messaging that functionality coming soon, OR disable forms temporarily
   - **Impact:** Medium (UX confusion)

4. **Navigation Item Conflicts**
   - **Risk:** Multiple tasks adding navigation items to same array
   - **Mitigation:** Coordinate with other Sub-Epic 2G tasks, sequential execution
   - **Impact:** Low (merge conflict, easy to resolve)

### Testing Requirements

1. **Translation Testing**
   - Verify all strings from `settings.account.*` display correctly
   - Test ICU format for dates and variables
   - Test with missing translations (fallback behavior)

2. **Form Validation Testing**
   - Test email format validation (valid/invalid emails)
   - Test password length validation
   - Test password match validation
   - Test required field validation

3. **Accessibility Testing**
   - Test keyboard navigation (tab through forms)
   - Test screen reader announcements
   - Verify aria-labels present and accurate
   - Test focus states visible

4. **Responsive Design Testing**
   - Test on mobile (320px width)
   - Test on tablet (768px width)
   - Test on desktop (1280px+ width)
   - Verify forms and buttons usable on all sizes

5. **Integration Testing**
   - Test navigation from user layout to account settings page
   - Test logout functionality still works after translation
   - Test user data displays correctly (email, dates)
   - Test role badge displays correctly (Admin/User)

### Open Questions

1. **Common Translations for UI Elements**
   - [ ] Do `common.roles.admin` and `common.roles.user` keys already exist?
   - [ ] Does `common.actions.logout` key already exist?
   - [ ] Should we add these to `common.*` namespace or create new keys?
   - **Decision needed before Step 6**

2. **Backend API Integration Timeline**
   - [ ] When will email change API be implemented?
   - [ ] When will password change API be implemented?
   - [ ] Should forms be fully functional or disabled until APIs ready?
   - **Recommendation:** Create forms but show "Coming soon" or disable submit for now

3. **Account Deletion Confirmation**
   - [ ] Should confirmation be a modal, dialog, or inline?
   - [ ] Should we use an existing modal component or create new?
   - **Recommendation:** Check for existing modal patterns in SimpleDashboard components

4. **Validation Error Messages**
   - [ ] Where should validation error keys live? `settings.account.validation.*` or `common.validation.*`?
   - [ ] Do we need to add these keys in this task or use existing common ones?
   - **Decision needed before Step 8**

5. **Date/Time Formatting**
   - [ ] Should date formatting be locale-aware (future: show dates in French format for French users)?
   - [ ] Use browser's `toLocaleDateString()` or library like `date-fns`?
   - **Recommendation:** Use browser API for now, revisit when locale switching implemented

---

## Out of Scope

The following items are explicitly **NOT** included in this task and should be handled separately:

### Backend API Implementation
- Email change API endpoint and logic
- Password change API endpoint and logic
- Account deletion API endpoint and logic
- Email verification flow
- Password reset flow

### Authentication Features
- Two-factor authentication (2FA) - Handled in Task 2G.4 (Security Settings)
- Active session management - Handled in Task 2G.4 (Security Settings)
- Login history - Handled in Task 2G.4 (Security Settings)
- Device management - Handled in Task 2G.4 (Security Settings)

### User Profile Features
- Profile photo upload - Handled in Task 2G.3 (Profile Components)
- Display name - Handled in Task 2G.3 (Profile Components)
- Bio/description - Handled in Task 2G.3 (Profile Components)

### Preferences Features
- Language selection - Handled in Task 2G.4 (Preferences Components)
- Theme selection (light/dark/system) - Handled in Task 2G.4 (Preferences Components)
- Timezone selection - Handled in Task 2G.4 (Preferences Components)

### Notification Settings
- Email notification preferences - Future work (Sub-Epic 2H or later)
- Push notification preferences - Future work
- Notification types configuration - Future work

### Subscription/Billing
- Subscription management - Future work (not in Epic 2)
- Payment information - Future work
- Billing history - Future work

### Data Export
- GDPR data export - Future work
- Account data download - Future work

### Multi-Language Translation
- French translations - Task 2G.6
- Spanish translations - Task 2G.6
- German translations - Task 2G.6
- Dutch translations - Task 2G.6
- Italian translations - Task 2G.6

---

## Success Metrics

### Quantitative Metrics

1. **Translation Coverage**
   - Target: 100% of account settings strings use translations
   - Measurement: Manual inspection, no hardcoded English strings

2. **Translation Key Usage**
   - Target: Use all ~20 keys from `settings.account.*` namespace
   - Measurement: Count keys referenced in components vs. available in en.json

3. **TypeScript Compilation**
   - Target: 0 compilation errors related to new code
   - Measurement: `npm run typecheck` exit code

4. **Page Accessibility**
   - Target: All interactive elements have aria-labels
   - Measurement: Manual inspection, count aria-label attributes

5. **Form Validation**
   - Target: 100% of form fields validate input
   - Measurement: Test each form field with valid/invalid inputs

### Qualitative Metrics

1. **Code Quality**
   - Consistent with existing component patterns
   - Proper TypeScript typing
   - Clean, readable code with comments where needed
   - Follows project conventions (file structure, naming)

2. **User Experience**
   - Forms are intuitive and easy to use
   - Error messages are clear and helpful
   - Success messages provide feedback
   - Dangerous actions (delete account) have clear warnings

3. **Accessibility**
   - Keyboard navigation works smoothly
   - Screen readers announce content correctly
   - Visual focus indicators clear
   - Color contrast meets WCAG standards

4. **Consistency**
   - Styling matches existing user pages
   - Component patterns follow established conventions
   - Translation usage matches other components (PropertyForm, PropertiesPage, etc.)

---

## Notes and Context

### Design Rationale

1. **Why Create Account Settings Page Now?**
   - Foundation for future features (email change, password change, 2FA)
   - Provides structure for Sub-Epic 2G completion
   - Demonstrates translation usage patterns for other settings pages
   - Users expect to find account settings in applications

2. **Why Separate Components for Each Section?**
   - Modularity and reusability
   - Easier to test and maintain
   - Can be moved to separate files if they grow large
   - Follows single responsibility principle

3. **Why Client-Side Only (No API Calls)?**
   - Focus of Epic 2 is internationalization, not backend implementation
   - Allows UI to be built and translated independently
   - Backend APIs can be added incrementally in future epics
   - Demonstrates translation patterns without backend complexity

4. **Why Update User Layout Header?**
   - Consistency - all UI strings should be internationalized
   - Low-hanging fruit - simple strings to translate
   - Sets example for future layout updates

### Historical Context

- **Epic 1 (L10N Foundation):** Established next-intl setup, translation file structure, patterns
- **Sub-Epics 2A-2F:** Translated authentication, items, properties, articles, rooms, tags (260+ components)
- **Task 2G.1 (REQ-E02-013):** Created `settings` namespace structure with 150 keys
- **Current Task (2G.2):** First implementation using `settings.account.*` keys

### Future Considerations

1. **Backend Integration**
   - Email change API: `/api/account/email` (POST)
   - Password change API: `/api/account/password` (POST)
   - Account deletion API: `/api/account/delete` (DELETE)
   - Consider rate limiting, security measures (current password verification, email confirmation)

2. **Enhanced Features**
   - Email verification flow (send code, verify code)
   - Password strength meter in UI
   - Recent account activity log
   - Connected accounts (OAuth providers)
   - Export account data (GDPR compliance)

3. **Security Enhancements**
   - Two-factor authentication (Task 2G.4)
   - Active session management (Task 2G.4)
   - Security event logging (login attempts, password changes)
   - Suspicious activity alerts

4. **User Experience Improvements**
   - Real-time email format validation (as user types)
   - Password strength indicator with requirements checklist
   - Account deletion cool-off period (30 days before permanent deletion)
   - In-app confirmation for email changes (instead of page reload)

### Related Documentation

- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md (lines 1099-1171)
- **Sub-Epic 2G Overview:** REQ-E02-013 (Task 2G.1) - Create settings namespace structure
- **Translation Files:** `/messages/*.json` (en, fr, es, de, nl, it)
- **Auth Context:** `/src/contexts/AuthContext.tsx` (user data, signOut function)
- **User Layout:** `/src/app/user/layout.tsx` (navigation, header)

---

## Appendix

### A. Complete `settings.account` Namespace Keys

From `/messages/en.json` lines 3385-3407:

```typescript
{
  "settings": {
    "account": {
      "title": string,                          // "Account Settings"
      "subtitle": string,                       // "Manage your account information and preferences"
      "email": string,                          // "Email Address"
      "emailDescription": string,               // "Your account email address"
      "emailInputAriaLabel": string,            // "Email address input field"
      "changeEmail": string,                    // "Change Email"
      "changeEmailButtonAriaLabel": string,     // "Change email address"
      "emailUpdated": string,                   // "Email updated to {email}" (ICU format)
      "currentPassword": string,                // "Current Password"
      "newPassword": string,                    // "New Password"
      "confirmPassword": string,                // "Confirm Password"
      "changePassword": string,                 // "Change Password"
      "passwordUpdated": string,                // "Password updated successfully"
      "deleteAccount": string,                  // "Delete Account"
      "deleteAccountButtonAriaLabel": string,   // "Delete account permanently"
      "deleteWarning": string,                  // "This action is permanent and cannot be undone."
      "deleteConfirmation": string,             // "Are you sure you want to delete your account?"
      "sessionsActive": string,                 // "{count, plural, one {# active session} other {# active sessions}}" (ICU plural)
      "lastLogin": string,                      // "Last login: {date} at {time}" (ICU format)
      "accountCreated": string,                 // "Account created: {date}" (ICU format)
      "manageSubscription": string              // "Manage Subscription"
    }
  }
}
```

**Total:** 20 keys

### B. User Layout Header Code Reference

**Current Implementation (Lines 180-208):**

```tsx
{/* Header */}
<div className="border-b border-gray-200 bg-white shadow-sm print:hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center py-4">
      {/* Left side - Title and user info */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">FAQBNB Dashboard</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isAdmin ? '👑 Admin' : '👤 User'}
            </span>
            <span className="text-sm text-gray-600">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Right side - Logout */}
      <button
        onClick={() => signOut()}
        className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 whitespace-nowrap"
      >
        Logout
      </button>
    </div>
  </div>
</div>
```

**Hardcoded Strings:**
1. Line 187: `"FAQBNB Dashboard"`
2. Line 192: `"👑 Admin"` / `"👤 User"`
3. Line 204: `"Logout"`

### C. Example Account Settings Page Structure

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function AccountSettingsPage() {
  const t = useTranslations('settings.account');
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Account Information Section */}
      <section className="mb-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{t('email')}</h2>
        <p className="text-sm text-gray-600 mb-2">{t('emailDescription')}</p>
        <p className="text-gray-900">{user?.email}</p>
        <p className="text-sm text-gray-500 mt-4">
          {t('accountCreated', { date: formatDate(user?.created_at) })}
        </p>
        <p className="text-sm text-gray-500">
          {t('lastLogin', {
            date: formatDate(user?.last_sign_in_at),
            time: formatTime(user?.last_sign_in_at)
          })}
        </p>
      </section>

      {/* Email Change Section */}
      <EmailChangeSection />

      {/* Password Change Section */}
      <PasswordChangeSection />

      {/* Account Deletion Section */}
      <AccountDeletionSection />
    </div>
  );
}
```

### D. Validation Error Messages

**May Need to Add These Keys** (check if exist in `common.validation.*` or `common.errors.*`):

```json
{
  "common": {
    "validation": {
      "emailRequired": "Email is required",
      "emailInvalid": "Please enter a valid email address",
      "passwordRequired": "Password is required",
      "passwordTooShort": "Password must be at least 8 characters",
      "passwordMismatch": "Passwords do not match",
      "fieldRequired": "This field is required"
    }
  }
}
```

**Alternatively, add to `settings.account.validation.*` namespace:**

```json
{
  "settings": {
    "account": {
      "validation": {
        "emailRequired": "Email is required",
        "emailInvalid": "Please enter a valid email address",
        "passwordRequired": "Password is required",
        "passwordTooShort": "Password must be at least 8 characters",
        "passwordMismatch": "Passwords do not match"
      }
    }
  }
}
```

**Decision:** Use existing `common.validation.*` keys if they exist, otherwise add to `settings.account.validation.*` in this task.

---

**End of Document**

---

*Document generated: 2026-01-22 21:03*
