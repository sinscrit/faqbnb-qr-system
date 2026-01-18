# REQ-322: Create Auth Namespace Structure in Translation File

**Last Modified:** 2026-01-18
**Type:** NEW FEATURE
**Size:** M (Medium)
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.1
**Status:** Not Started

---

## Summary

Create a dedicated `auth` namespace within the translation file (`/messages/en.json`) to centralize and organize all authentication and registration-related text strings. This namespace will serve as the foundation for internationalizing all authentication flows including login, signup, password reset, account verification, and session management.

---

## Context

### Epic 2 Context
This task is part of **L10N Epic 2 - Static UI Translation**, which involves extracting approximately 3,200+ hardcoded UI strings from 275+ React components. The `auth` namespace is estimated to contain ~150 strings and is prioritized as the **third sub-epic** to implement (after Common & Shared, and Error Messages) because authentication forms the entry point to the application.

### Dependencies
- **Epic 1 Foundation Required:** This task assumes Epic 1 (next-intl setup) is complete with:
  - `next-intl` package installed (`package.json`)
  - i18n config created (`/src/lib/i18n/config.ts`)
  - IntlProvider wrapper in place (`/src/app/layout.tsx`)
  - Base translation files created (`/messages/*.json`)

### Current State
- No `auth` namespace currently exists in translation files
- Authentication components contain hardcoded English strings
- No centralized location for authentication-related translation keys

---

## Implementation Details

### File to Create/Modify

**Primary File:** `/messages/en.json`

Add the following `auth` namespace structure:

```json
{
  "auth": {
    "login": {
      "title": "Sign in to your account",
      "subtitle": "Access the FAQBNB administration panel",
      "emailLabel": "Email Address",
      "emailPlaceholder": "Enter your email",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Enter your password",
      "submitButton": "Sign In",
      "googleButton": "Continue with Google",
      "forgotPassword": "Forgot password?",
      "noAccount": "Don't have an account?",
      "signUp": "Sign up",
      "backToHome": "Back to Home",
      "clearSession": "Clear Session",
      "secureAccess": "Secure Access",
      "secureAccessDescription": "This area is restricted to authorized administrators only. All access attempts are logged and monitored.",
      "rememberMe": "Remember me for 30 days",
      "orContinueWith": "Or continue with email",
      "loading": {
        "authenticating": "Completing authentication...",
        "signingIn": "Signing In...",
        "connectingGoogle": "Connecting to Google..."
      },
      "messages": {
        "success": "Login successful! Redirecting...",
        "completingGoogle": "Completing Google sign-in..."
      }
    },
    "register": {
      "title": "Create your account",
      "subtitle": "Join FAQBNB and start managing your properties",
      "fullNameLabel": "Full Name",
      "fullNamePlaceholder": "John Doe",
      "fullNameOptional": "(optional)",
      "emailLabel": "Email Address",
      "emailLinked": "This email is linked to your access code and cannot be changed.",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Create a strong password",
      "confirmPasswordLabel": "Confirm Password",
      "confirmPasswordPlaceholder": "Confirm your password",
      "termsLabel": "I agree to the",
      "termsOfService": "Terms of Service",
      "and": "and",
      "privacyPolicy": "Privacy Policy",
      "submitButton": "Create Account",
      "creating": "Creating Account...",
      "googleOption": "Continue with Google",
      "googleDescription": "Quick sign-up using your Google account",
      "emailOption": "Sign up with email",
      "emailDescription": "Create a password for your account",
      "chooseMethod": "Choose how to create your account",
      "accessCodeInfo": "Access code:",
      "accountLinked": "Your account will be linked to your verified access code",
      "passwordStrength": {
        "label": "Password strength:",
        "veryWeak": "Very Weak",
        "weak": "Weak",
        "fair": "Fair",
        "good": "Good",
        "strong": "Strong",
        "requirements": "Requirements:",
        "minChars": "At least 8 characters",
        "lowercase": "One lowercase letter",
        "uppercase": "One uppercase letter",
        "number": "One number",
        "special": "One special character"
      },
      "passwordMatch": {
        "match": "Passwords match",
        "noMatch": "Passwords do not match"
      },
      "connectingGoogle": "Connecting to Google...",
      "failed": "Registration Failed"
    },
    "logout": {
      "button": "Sign Out",
      "loggingOut": "Signing out...",
      "confirmTitle": "Sign Out",
      "confirmMessage": "Are you sure you want to sign out?"
    },
    "accessCode": {
      "label": "Access Code",
      "placeholder": "Enter your access code",
      "validating": "Validating access code...",
      "invalid": "Invalid access code",
      "expired": "Access code has expired",
      "alreadyUsed": "Access code has already been used"
    },
    "passwordReset": {
      "title": "Reset your password",
      "subtitle": "Enter your email to receive reset instructions",
      "emailLabel": "Email Address",
      "emailPlaceholder": "Enter your email",
      "submitButton": "Send Reset Link",
      "sending": "Sending...",
      "backToLogin": "Back to login",
      "success": {
        "title": "Check your email",
        "message": "We've sent password reset instructions to {email}"
      },
      "newPassword": {
        "title": "Create new password",
        "subtitle": "Enter your new password below",
        "passwordLabel": "New Password",
        "confirmLabel": "Confirm New Password",
        "submitButton": "Reset Password",
        "success": "Password reset successfully"
      }
    },
    "verification": {
      "title": "Verify your email",
      "subtitle": "We've sent a verification link to {email}",
      "resendButton": "Resend verification email",
      "resending": "Resending...",
      "resent": "Verification email sent",
      "checkSpam": "Didn't receive it? Check your spam folder.",
      "success": {
        "title": "Email verified",
        "message": "Your email has been successfully verified"
      }
    },
    "session": {
      "expired": "Your session has expired. Please sign in again.",
      "expiringSoon": "Your session will expire soon. Would you like to stay signed in?",
      "extendButton": "Stay signed in",
      "concurrentWarning": "You are signed in on another device",
      "signOutOther": "Sign out other sessions"
    },
    "validation": {
      "emailRequired": "Email is required",
      "emailInvalid": "Please enter a valid email address",
      "passwordRequired": "Password is required",
      "passwordMinLength": "Password must be at least {min} characters",
      "passwordMismatch": "Passwords do not match",
      "passwordWeak": "Password must include uppercase, lowercase, and numbers",
      "termsRequired": "You must accept the terms and conditions",
      "nameRequired": "Name is required"
    },
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "emailNotVerified": "Please verify your email address",
      "accountLocked": "Account has been locked. Contact support.",
      "accessDenied": "Access denied. Admin privileges are required.",
      "tooManyAttempts": "Too many authentication attempts. Please try again in {minutes} minutes.",
      "googleAuthFailed": "Google authentication failed. Please try again.",
      "networkError": "Network error. Please check your connection.",
      "unknownError": "An unexpected error occurred. Please try again."
    }
  }
}
```

### Key Naming Conventions

Follow these patterns established in the implementation plan:

| Pattern | Example | Use Case |
|---------|---------|----------|
| `{namespace}.{area}.{element}` | `auth.login.title` | Page/section titles |
| `{namespace}.{area}.{field}Label` | `auth.login.emailLabel` | Form field labels |
| `{namespace}.{area}.{field}Placeholder` | `auth.login.emailPlaceholder` | Form placeholders |
| `{namespace}.{area}.loading.{action}` | `auth.login.loading.signingIn` | Loading states |
| `{namespace}.{area}.messages.{type}` | `auth.login.messages.success` | Status messages |
| `{namespace}.validation.{field}{Rule}` | `auth.validation.emailRequired` | Validation errors |
| `{namespace}.errors.{errorType}` | `auth.errors.invalidCredentials` | Error messages |

### Namespace Categories

| Category | Description | Example Keys |
|----------|-------------|--------------|
| `login` | Login form and page strings | `title`, `emailLabel`, `submitButton` |
| `register` | Registration form and flow | `title`, `passwordStrength.*`, `chooseMethod` |
| `logout` | Logout actions and confirmations | `button`, `confirmMessage` |
| `accessCode` | Access code validation flow | `label`, `validating`, `invalid` |
| `passwordReset` | Password reset flow | `title`, `newPassword.*`, `success.*` |
| `verification` | Email verification flow | `title`, `resendButton`, `success.*` |
| `session` | Session management messages | `expired`, `extendButton` |
| `validation` | Form validation messages | `emailRequired`, `passwordMinLength` |
| `errors` | Authentication error messages | `invalidCredentials`, `tooManyAttempts` |

---

## Acceptance Criteria

- [ ] An `auth` namespace section exists in `/messages/en.json` with clear logical structure
- [ ] The namespace includes categories for: login, signup, password reset, account verification, session management, and authentication errors
- [ ] Login category contains strings for form labels, placeholders, button text, remember me options, and forgot password links
- [ ] Signup category contains strings for registration form fields, password requirements, terms acceptance, and account creation confirmation
- [ ] Password reset category contains strings for reset request flows, email sent confirmations, new password forms, and reset success messages
- [ ] Account verification category contains strings for verification prompts, resend verification options, and verification success messages
- [ ] Session management category contains strings for session expiration notifications, logout confirmations, and concurrent session warnings
- [ ] Authentication errors subcategory contains specific error messages for invalid credentials, account locked, email not verified, and other auth-specific failures
- [ ] The structure supports dynamic parameter substitution for usernames, email addresses, time values, or other contextual authentication information (using `{param}` syntax)
- [ ] The namespace structure is extensible to accommodate additional authentication features such as social login, multi-factor authentication, or single sign-on
- [ ] Documentation or comments within the file clarify the purpose and organization of the auth namespace categories
- [ ] The structure follows the same organizational conventions as other namespaces in the translation file
- [ ] The file remains valid JSON after the auth namespace addition

---

## Authorized Files and Functions for Modification

### Files to Create/Modify

| File Path | Action | Description |
|-----------|--------|-------------|
| `/messages/en.json` | MODIFY | Add `auth` namespace structure |

### Integration Points (Future Tasks)

These files will be updated in subsequent tasks (2A.2-2A.10) to use the auth namespace:

| File Path | Task ID | Estimated Strings |
|-----------|---------|-------------------|
| `/src/app/login/LoginPageContent.tsx` | 2A.2 | ~40 |
| `/src/components/LoginForm.tsx` | 2A.3 | ~30 |
| `/src/components/RegistrationForm.tsx` | 2A.4 | ~50 |
| `/src/components/GoogleOAuthButton.tsx` | 2A.5 | ~10 |
| `/src/app/register/page.tsx` | 2A.6 | ~15 |
| `/src/app/register/success/page.tsx` | 2A.7 | ~5 |
| `/src/app/register/complete/page.tsx` | 2A.8 | ~5 |

---

## Technical Notes

### Dynamic Parameter Interpolation

Use ICU message format for variables:

```json
{
  "auth.validation.passwordMinLength": "Password must be at least {min} characters",
  "auth.errors.tooManyAttempts": "Too many authentication attempts. Please try again in {minutes} minutes.",
  "auth.verification.subtitle": "We've sent a verification link to {email}"
}
```

Usage in components (after Task 2A.2+):
```typescript
const t = useTranslations('auth.validation');
t('passwordMinLength', { min: 6 }); // "Password must be at least 6 characters"
```

### Pluralization (If Needed)

Use ICU plural format:

```json
{
  "auth.session.expiresIn": "{count, plural, =1 {1 minute} other {# minutes}} until session expires"
}
```

### Nested Key Access

The namespace supports deep nesting with dot notation:

```typescript
const t = useTranslations('auth');
t('login.title');                    // "Sign in to your account"
t('register.passwordStrength.weak'); // "Weak"
t('errors.invalidCredentials');      // "Invalid email or password"
```

Or scoped to a subsection:

```typescript
const t = useTranslations('auth.login');
t('title');                          // "Sign in to your account"
t('loading.signingIn');             // "Signing In..."
```

---

## Testing Verification

After implementation:

1. **JSON Validity:** Ensure `/messages/en.json` is valid JSON
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('./messages/en.json'))"
   ```

2. **Key Completeness:** Verify all planned keys are present
   ```bash
   # Count auth namespace keys
   cat messages/en.json | jq '.auth | paths | length'
   ```

3. **Structure Consistency:** Compare against plan structure in implementation plan

---

## Dependencies

### Requires (Must be complete before this task)
- REQ-229: Install and Configure next-intl
- REQ-230: Create i18n Configuration Files
- REQ-232: Create IntlProvider Wrapper

### Enables (Tasks that depend on this)
- Task 2A.2: Update `/src/app/login/LoginPageContent.tsx`
- Task 2A.3: Update `/src/components/LoginForm.tsx`
- Task 2A.4: Update `/src/components/RegistrationForm.tsx`
- Task 2A.5: Update `/src/components/GoogleOAuthButton.tsx`
- Task 2A.6: Update `/src/app/register/page.tsx`
- Task 2A.7: Update `/src/app/register/success/page.tsx`
- Task 2A.8: Update `/src/app/register/complete/page.tsx`
- Task 2A.9: Generate translations for 5 non-English languages

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [PRD: L10N Epic 2](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

## Estimated Effort

| Activity | Estimate |
|----------|----------|
| Create namespace structure | 30 min |
| Review and validate JSON | 15 min |
| Total | ~45 min |

---

*Document generated for FAQBNB L10N Epic 2 - Sub-Epic 2A Task 2A.1*
