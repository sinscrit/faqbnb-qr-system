# Implementation Overview: Radio Button Registration Method Selection for Gmail Users

## Header
| Field | Value |
|-------|-------|
| Request Reference | #222 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-13 |
| Breakdown Created | 2026-01-13 20:21:34 CET |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |

## Goals

Implement a radio button selection mechanism in the registration form that allows Gmail users to choose between two mutually exclusive registration methods:

1. **Google OAuth Registration** - Streamlined path using Google authentication
2. **Email/Password Registration** - Traditional credential-based registration

The form must dynamically show/hide fields based on the selected method, reducing visual clutter and clarifying the user's chosen registration path.

### Assumptions & Clarifications

- REQ-221 has been implemented and provides the `isGmailEmail` detection logic (verified in `RegistrationForm.tsx` line 76)
- The `GoogleOAuthButton` component already exists and functions correctly
- The existing form structure (FormData interface, validation, handlers) will be preserved
- Radio button implementation will follow the existing patterns in `TimeRangeSelector.tsx` and `ContentTypeStep.tsx`
- The email field remains read-only as it's pre-filled from the access code
- Terms checkbox is required for both registration methods

## Implementation Plan

### Step 1: Add Registration Method State Management

- **Description**: Introduce a new state variable to track the selected registration method ('google' | 'email-password'). Initialize to 'google' when Gmail is detected.
- **Rationale**: State management must be established first as all subsequent UI changes depend on this value.
- **Estimated Effort**: S (30 minutes)

### Step 2: Create Radio Button Group Component

- **Description**: Build an accessible radio button group with two options following the existing patterns. Use ARIA roles (`role="radiogroup"`, `role="radio"`, `aria-checked`). Implement keyboard navigation (arrow keys, Enter/Space to select).
- **Rationale**: The radio group is the primary UI control that triggers all conditional rendering logic.
- **Estimated Effort**: M (1-1.5 hours)

### Step 3: Implement Conditional Field Visibility

- **Description**: Wrap Full Name, Password, Confirm Password fields and Create Account button in conditional rendering based on the registration method. When 'google' is selected, these fields are hidden. When 'email-password' is selected, all fields are visible.
- **Rationale**: Field visibility is the core UX improvement - showing only relevant fields based on user intent.
- **Estimated Effort**: M (1 hour)

### Step 4: Update Google OAuth Button State

- **Description**: Modify the GoogleOAuthButton's disabled state to account for the registration method selection. When 'email-password' is selected, the button becomes disabled and greyed out. The button remains enabled (subject to terms acceptance) when 'google' is selected.
- **Rationale**: The OAuth button must provide clear visual feedback that it's unavailable when the user has chosen email/password registration.
- **Estimated Effort**: S (30 minutes)

### Step 5: Adjust Layout and Transitions

- **Description**: Update CSS transitions and spacing to handle the show/hide animations smoothly. The OAuth section positioning should adapt based on whether fields are shown or hidden. Ensure proper spacing is maintained in both states.
- **Rationale**: Smooth transitions improve perceived quality and prevent jarring layout shifts.
- **Estimated Effort**: S (45 minutes)

### Step 6: Update Form Validation Logic

- **Description**: Modify `validateForm()` to skip password validation when 'google' registration method is selected. The form should only validate required fields for the active registration path.
- **Rationale**: Validation must align with the visible/active form fields to prevent blocking submission due to hidden empty fields.
- **Estimated Effort**: S (30 minutes)

### Step 7: Handle Registration Method Changes

- **Description**: When user switches from 'email-password' back to 'google', clear any entered password data for security. Reset validation errors related to hidden fields.
- **Rationale**: Security best practice to not retain sensitive data when the user indicates they won't use it.
- **Estimated Effort**: S (30 minutes)

### Step 8: Testing and Accessibility Verification

- **Description**: Write unit tests for radio button selection, field visibility toggling, and form submission for both paths. Verify keyboard navigation and screen reader compatibility.
- **Rationale**: Comprehensive testing ensures the feature works correctly and is accessible to all users.
- **Estimated Effort**: M (1-1.5 hours)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Primary Component: RegistrationForm.tsx

| File | Target | Type |
|------|--------|------|
| `src/components/RegistrationForm.tsx` | `RegistrationFormProps` interface | Modify - no changes needed |
| `src/components/RegistrationForm.tsx` | `FormData` interface | Modify - no changes needed |
| `src/components/RegistrationForm.tsx` | State declarations (lines 59-70) | Modify - add `registrationMethod` state |
| `src/components/RegistrationForm.tsx` | `isGmailEmail` derived state (line 76) | No change - already exists from REQ-221 |
| `src/components/RegistrationForm.tsx` | `validateForm()` (lines 232-249) | Modify - add conditional password validation |
| `src/components/RegistrationForm.tsx` | `handleInputChange()` (lines 252-282) | Modify - add handler for radio button changes |
| `src/components/RegistrationForm.tsx` | `oauthSection` JSX (lines 438-468) | Modify - integrate radio buttons, update layout |
| `src/components/RegistrationForm.tsx` | Full Name field JSX (lines 525-546) | Modify - add conditional rendering |
| `src/components/RegistrationForm.tsx` | Password field JSX (lines 548-617) | Modify - add conditional rendering |
| `src/components/RegistrationForm.tsx` | Confirm Password field JSX (lines 619-675) | Modify - add conditional rendering |
| `src/components/RegistrationForm.tsx` | Submit button JSX (lines 722-739) | Modify - add conditional rendering |

### Supporting Component: GoogleOAuthButton.tsx

| File | Target | Type |
|------|--------|------|
| `src/components/GoogleOAuthButton.tsx` | Button className (lines 102-109) | Modify - add greyed-out styling for disabled state |

### Test Files (Create)

| File | Target | Type |
|------|--------|------|
| `src/components/__tests__/RegistrationForm.test.tsx` | — | Create - unit tests for radio button functionality |
| `src/components/__tests__/RegistrationForm.a11y.test.tsx` | — | Create - accessibility tests for radio group |

## Dependencies

### Internal Dependencies

| Dependency | Relationship |
|------------|--------------|
| REQ-221 | **PREREQUISITE** - Provides `isGmailEmail` detection and contextual OAuth display |
| `GoogleOAuthButton` component | Used as-is, only styling modifications |
| `useRegistration` hook | No changes required - handles both OAuth and email/password flows |

### External Dependencies

| Dependency | Purpose |
|------------|---------|
| Lucide React icons | Already imported - may use additional icons for radio buttons |
| Tailwind CSS | Styling for radio buttons and transitions |

## Risks and Considerations

### Potential Side Effects

1. **Form Submission Logic**: The `handleSubmit` function currently assumes all password fields are present. Need to ensure it handles the case where password fields are empty because user chose Google OAuth.

2. **OAuth Flow Interruption**: If a user starts the Google OAuth flow and then returns without completing it, the form state should remain intact.

3. **Password Strength Indicator**: The password strength calculation runs on password input change. When fields are hidden, ensure no residual errors or indicators persist.

4. **Terms Checkbox Positioning**: The terms checkbox is currently placed after password fields. With conditional rendering, its position relative to other elements may need adjustment.

### Testing Requirements

1. **Gmail Address Detection**: Verify radio buttons appear only for `@gmail.com` addresses
2. **Default Selection**: Confirm "Continue with Google" is pre-selected for Gmail users
3. **Field Visibility Toggle**: Test showing/hiding of Full Name, Password, Confirm Password fields
4. **OAuth Button States**: Verify enabled/disabled states based on registration method and terms acceptance
5. **Form Submission**: Test both registration paths complete successfully
6. **Email Domain Change**: Verify radio buttons disappear when email changes from Gmail to non-Gmail
7. **Keyboard Navigation**: Test arrow key navigation within radio group
8. **Screen Reader Compatibility**: Verify proper announcements for radio selection changes
9. **Transition Smoothness**: Visual inspection of show/hide animations

### Open Questions

- [ ] Should the radio buttons use a visual style consistent with existing button-based selectors (like `TimeRangeSelector`) or standard form radio inputs?
- [ ] When the user switches from 'email-password' to 'google', should entered Full Name be preserved (since Google OAuth might still use it)?
- [ ] Should there be a brief delay or confirmation when toggling between methods to prevent accidental switches?

## Out of Scope

Per the original request, the following are explicitly **NOT** part of this implementation:

1. **Non-Gmail Email Handling**: No changes to the registration flow for non-Gmail users
2. **Login Form Changes**: This only affects the registration form, not `LoginForm.tsx`
3. **OAuth Provider Expansion**: No adding of other OAuth providers (Apple, Microsoft, etc.)
4. **Backend Changes**: No modifications to API routes or database schema
5. **New Component Library**: Use existing styling patterns, no introducing new UI libraries
6. **Mobile App Changes**: This is web-only; no React Native considerations

## Implementation Notes

### Existing Code Patterns to Follow

**Radio Button Pattern** (from `TimeRangeSelector.tsx`):
```typescript
// Uses role="radiogroup" container
// Individual buttons have role="radio", aria-checked
// Keyboard navigation with arrow keys
// Visual state differentiation for selected/unselected
```

**Conditional Visibility Pattern** (from existing `oauthSection` in `RegistrationForm.tsx`):
```typescript
// Uses Tailwind transition classes
// max-h-0/max-h-40 for height animation
// opacity-0/opacity-100 for fade
// overflow-hidden during transitions
```

### Suggested State Structure

```typescript
// New state to add
const [registrationMethod, setRegistrationMethod] = useState<'google' | 'email-password'>('google');

// Registration method should reset to 'google' when email changes to Gmail
// and be irrelevant (hidden) when email is not Gmail
```

### Suggested Radio Button Labels

- Option 1: "Continue with Google" (matches existing button text)
- Option 2: "Sign up with email and password"

---
*Document generated: 2026-01-13 20:21:34 CET*
