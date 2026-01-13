# Implementation Overview: Contextual Google OAuth Display in Registration Form

## Header
| Field | Value |
|-------|-------|
| Request Reference | #221 |
| Source File | docs/gen_requests.md |
| Original Request Date | 2026-01-13 21:45 |
| Breakdown Created | 2026-01-13 19:26:06 CET |
| T-shirt Size | M |
| Estimated Effort | 2-3 hours |

## Goals

Transform the registration form's Google OAuth section to:
1. Reposition the "Continue with Google" button from bottom of form to immediately after the email field section
2. Implement conditional visibility logic based on email domain detection (`@gmail.com` suffix)
3. Dynamically show/hide both the OAuth button and the "OR" divider based on email domain
4. Ensure smooth layout transitions when toggling OAuth section visibility

### Assumptions & Clarifications
- The email field in the registration form is pre-populated from URL parameters and is read-only (line 467 of RegistrationForm.tsx shows `disabled={true}`)
- Email domain check is performed on `formData.email` which is synced with the `email` prop
- Since the email is pre-filled and read-only, the visibility state is essentially static for each registration session (no need for debouncing)
- The acceptance criteria mentions "dynamically as the user types" but in practice, the email is pre-filled - the implementation should still support this for future flexibility
- Only `@gmail.com` domain triggers OAuth visibility (not other Google Workspace domains like custom domains using Google)

## Implementation Plan

### Step 1: Add Email Domain Detection Helper Function
- **Description**: Create a helper function or derived state to determine if the current email ends with `@gmail.com`
- **Rationale**: Centralizes the domain check logic for reuse and testing. Should be implemented near the top of the component with other state/computed values.
- **Estimated Effort**: S (15 minutes)

### Step 2: Restructure JSX Layout - Move OAuth Section
- **Description**: Move the "OR" divider and GoogleOAuthButton from their current position (after Submit button, lines 697-714) to immediately after the Email Field section (after line 479) and before the Full Name field (line 481)
- **Rationale**: Following the request's specified order - OAuth option should appear prominently after email verification, before personal information fields. This encourages Gmail users to use the streamlined OAuth path.
- **Estimated Effort**: S (15 minutes)

### Step 3: Implement Conditional Rendering with Animation
- **Description**: Wrap the OAuth section (divider + button) in conditional rendering logic based on the Gmail domain check. Add CSS transition classes for smooth show/hide animation.
- **Rationale**: Prevents UI "jumping" when section appears/disappears. Conditional rendering ensures clean DOM when OAuth is hidden.
- **Estimated Effort**: M (30-45 minutes)

### Step 4: Update Form Spacing and Visual Hierarchy
- **Description**: Adjust spacing classes (margin/padding) on surrounding elements to maintain proper visual hierarchy in both states (OAuth visible vs hidden)
- **Rationale**: Ensures the form looks polished whether or not the Gmail OAuth section is displayed
- **Estimated Effort**: S (15-20 minutes)

### Step 5: Testing and Edge Cases
- **Description**: Test with various email domains (gmail.com, googlemail.com, outlook.com, custom domains). Verify layout in both URL mode and manual entry mode.
- **Rationale**: Ensures the feature works correctly across all registration entry paths
- **Estimated Effort**: M (30 minutes)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Primary File: RegistrationForm.tsx
| File | Target | Type |
|------|--------|------|
| `src/components/RegistrationForm.tsx` | Component body (add `isGmailEmail` computed value) | Modify |
| `src/components/RegistrationForm.tsx` | JSX return statement (lines 429-723) | Modify |
| `src/components/RegistrationForm.tsx` | Email Field section (lines 456-479) | Modify (add OAuth section after) |
| `src/components/RegistrationForm.tsx` | OAuth Divider section (lines 697-705) | Remove from current location |
| `src/components/RegistrationForm.tsx` | GoogleOAuthButton render (lines 707-714) | Remove from current location |

### Supporting Files (Read-Only Reference)
| File | Purpose |
|------|---------|
| `src/components/GoogleOAuthButton.tsx` | Reference for props interface - no changes needed |
| `src/app/register/RegistrationPageContent.tsx` | Reference for form usage context - no changes needed |

## Dependencies

### Internal Dependencies
- None - this is a self-contained UI enhancement within RegistrationForm.tsx

### External Dependencies
- None - uses existing GoogleOAuthButton component without modification

## Risks and Considerations

### Potential Side Effects
- **Layout shift**: Moving the OAuth section may cause layout differences that affect the overall form height and page scroll position
- **Terms checkbox dependency**: The GoogleOAuthButton is currently disabled when `!formData.agreeToTerms` (line 713). After moving the button above the terms checkbox, users would see a disabled OAuth button before scrolling to/accepting terms. Consider if this UX is acceptable or if the button should have a tooltip explaining why it's disabled.
- **Manual entry mode**: In manual entry mode (when URL params are missing), the email is not pre-filled. The implementation must handle empty/partial email states gracefully.

### Testing Requirements
- [ ] Test with Gmail email (e.g., `user@gmail.com`) - OAuth section should be visible
- [ ] Test with non-Gmail email (e.g., `user@outlook.com`) - OAuth section should be hidden
- [ ] Test with empty email state (manual entry before email entered)
- [ ] Test layout on mobile viewport sizes
- [ ] Test that OAuth button remains properly disabled when terms not accepted
- [ ] Test smooth transition animation when email changes (if applicable)
- [ ] Verify no console errors or React warnings

### Open Questions
- [ ] Should `@googlemail.com` (alternative Gmail domain used in some countries) also trigger OAuth visibility?
- [ ] Should Google Workspace custom domains (e.g., `user@company.com` using Google) be detected? (Currently out of scope per requirements)
- [ ] Is the current behavior of requiring terms acceptance before OAuth correct, or should OAuth bypass terms since Google has its own consent flow?

## Out of Scope
- Changes to GoogleOAuthButton component itself
- Server-side email domain validation
- Support for Google Workspace custom domains
- Changes to the OAuth callback flow or registration API
- Modifications to manual entry mode's AccessCodeInput component
- Any changes to the success/error message handling

---
*Document generated: 2026-01-13 19:26:06 CET*
