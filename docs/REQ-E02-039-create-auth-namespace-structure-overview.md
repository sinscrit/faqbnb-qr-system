# REQ-E02-039: Create Authentication Namespace Structure for Translations - Implementation Breakdown

**Document Created:** 2026-01-20 12:15 UTC
**Last Modified:** 2026-01-20 12:15 UTC
**Request Reference:** docs/gen_requests_epic2.md - Request #39
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Epic:** Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.1
**Estimated Size:** M (Medium)

---

## 1. Overview

### 1.1 Summary

Create the `auth` namespace structure in the translation files (`/messages/en.json` and corresponding files for other languages) to support multi-language authentication experiences. This task establishes the translation key hierarchy for all authentication-related UI strings including login, registration, password management, OAuth flows, and session handling.

### 1.2 Current State Analysis

The existing `messages/en.json` file has a basic `auth` namespace with minimal keys:

```json
"auth": {
  "signIn": "Sign In",
  "signOut": "Sign Out",
  "confirmLogout": "Confirm Logout",
  "confirmSignOutMessage": "Are you sure you want to sign out?",
  "signUp": "Sign Up",
  "email": "Email",
  "password": "Password",
  "forgotPassword": "Forgot Password?",
  "resetPassword": "Reset Password",
  "continueWithGoogle": "Continue with Google",
  "rememberMe": "Remember me",
  "noAccount": "Don't have an account?",
  "hasAccount": "Already have an account?",
  "createAccount": "Create Account",
  "verifyEmail": "Verify Email",
  "resendVerification": "Resend Verification",
  "welcomeBack": "Welcome back",
  "loggedInAs": "Logged in as"
}
```

This current structure covers only ~20 strings and is missing the comprehensive coverage needed for full authentication flow internationalization.

### 1.3 Target State

A fully comprehensive `auth` namespace structure covering approximately 150+ strings organized into logical sub-namespaces:

- `auth.login.*` - Login page strings
- `auth.register.*` - Registration form strings
- `auth.oauth.*` - OAuth/Google authentication strings
- `auth.password.*` - Password-related strings
- `auth.accessCode.*` - Access code validation strings
- `auth.session.*` - Session management strings
- `auth.messages.*` - Status and feedback messages
- `auth.validation.*` - Form validation messages
- `auth.complete.*` - Complete registration page strings

---

## 2. Analysis of Authentication Components

### 2.1 Components Requiring Translation

| Component | File Path | Estimated Strings |
|-----------|-----------|-------------------|
| LoginPageContent | `/src/app/login/LoginPageContent.tsx` | ~35 |
| LoginForm | `/src/components/LoginForm.tsx` | ~25 |
| RegistrationForm | `/src/components/RegistrationForm.tsx` | ~50 |
| GoogleOAuthButton | `/src/components/GoogleOAuthButton.tsx` | ~10 |
| Register page | `/src/app/register/page.tsx` | ~5 |
| RegistrationPageContent | `/src/app/register/RegistrationPageContent.tsx` | ~40 |
| Registration Success | `/src/app/register/success/page.tsx` | ~25 |
| Complete Registration | `/src/app/register/complete/page.tsx` | ~30 |

**Total Estimated Strings:** ~220 (may consolidate to ~150 unique keys)

### 2.2 String Categories Identified

Based on component analysis:

1. **Page Titles & Subtitles**
   - "Sign in to your account"
   - "Access the FAQBNB administration panel"
   - "Create your account"
   - "Complete your registration"

2. **Form Field Labels & Placeholders**
   - "Email Address" / "Enter your email"
   - "Password" / "Enter your password"
   - "Full Name" / "John Doe"
   - "Confirm Password" / "Confirm your password"
   - "Access Code" / "Enter your access code"

3. **Button Labels**
   - "Sign In"
   - "Sign In with Email"
   - "Continue with Google"
   - "Create Account"
   - "Complete Registration"

4. **Help Text & Descriptions**
   - "This email is linked to your access code and cannot be changed."
   - "Access restricted to authorized administrators only"
   - "Your account will be linked to your verified access code"
   - "Check your email for the access code from your invitation."

5. **Status Messages**
   - "Login successful! Redirecting..."
   - "Completing Google sign-in..."
   - "Creating Account..."
   - "Connecting to Google..."

6. **Error Messages**
   - "Invalid email or password"
   - "Access denied. Admin privileges are required."
   - "Authentication Failed"
   - "Registration Failed"

7. **Session & Security Messages**
   - "Secure Access"
   - "This area is restricted to authorized administrators only."
   - "All access attempts are logged and monitored."
   - "Clear Session"

8. **Password Strength Indicators**
   - "Very Weak", "Weak", "Fair", "Good", "Strong"
   - "At least 8 characters"
   - "One lowercase letter"
   - "One uppercase letter"
   - "One number"
   - "One special character"

9. **OAuth-Specific Strings**
   - "Continue with Google"
   - "Quick sign-up using your Google account"
   - "Sign up with email"
   - "Create a password for your account"
   - "Choose how to create your account"

10. **Terms & Legal**
    - "I agree to the"
    - "Terms of Service"
    - "Privacy Policy"

---

## 3. Implementation Tasks

### Task 3.1: Expand Auth Namespace in English Translation File

**Objective:** Create the comprehensive `auth` namespace structure in `/messages/en.json`

**Detailed Actions:**

1. Open `/messages/en.json`
2. Replace the existing minimal `auth` section with the expanded structure
3. Organize keys following the `{namespace}.{section}.{element}` convention
4. Ensure all strings use semantic naming that indicates context and purpose

**Proposed Namespace Structure:**

```json
{
  "auth": {
    "login": {
      "title": "Sign in to your account",
      "subtitle": "Access the FAQBNB administration panel",
      "emailLabel": "Email Address",
      "emailPlaceholder": "admin@faqbnb.com",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Enter your password",
      "submitButton": "Sign In",
      "emailButton": "Sign In with Email",
      "rememberMe": "Remember me for 30 days",
      "dividerText": "Or continue with email",
      "accessRestricted": "Access restricted to authorized administrators only",
      "backToHome": "Back to Home",
      "clearSession": "Clear Session"
    },
    "register": {
      "title": "Create your account",
      "subtitle": "Complete your registration to access FAQBNB",
      "pageSubtitle": "Account Registration",
      "fullNameLabel": "Full Name",
      "fullNamePlaceholder": "John Doe",
      "fullNameOptional": "(optional)",
      "emailLabel": "Email Address",
      "emailReadOnlyHint": "This email is linked to your access code and cannot be changed.",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Create a strong password",
      "confirmPasswordLabel": "Confirm Password",
      "confirmPasswordPlaceholder": "Confirm your password",
      "submitButton": "Create Account",
      "submittingButton": "Creating Account...",
      "accountLinkedHint": "Your account will be linked to your verified access code",
      "alreadyHaveAccount": "Already have an account?"
    },
    "passwordStrength": {
      "label": "Password strength:",
      "veryWeak": "Very Weak",
      "weak": "Weak",
      "fair": "Fair",
      "good": "Good",
      "strong": "Strong",
      "requirementsLabel": "Requirements:",
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
    "terms": {
      "agreeTo": "I agree to the",
      "termsOfService": "Terms of Service",
      "and": "and",
      "privacyPolicy": "Privacy Policy"
    },
    "oauth": {
      "continueWithGoogle": "Continue with Google",
      "connectingToGoogle": "Connecting to Google...",
      "signInWithAccount": "Sign in with your account",
      "chooseMethod": "Choose how to create your account",
      "googleOption": "Continue with Google",
      "googleDescription": "Quick sign-up using your Google account",
      "emailOption": "Sign up with email",
      "emailDescription": "Create a password for your account",
      "dividerText": "Enter your details below",
      "tooManyAttempts": "Too many authentication attempts. Please try again in {minutes} minutes."
    },
    "accessCode": {
      "label": "Access Code",
      "placeholder": "Enter your access code",
      "infoPrefix": "Access code:",
      "verified": "Access code verified:",
      "checkEmailHint": "Check your email for the access code from your invitation.",
      "requestNew": "Request New Access",
      "requestAccessCode": "Request Access Code"
    },
    "complete": {
      "title": "Almost there!",
      "subtitle": "Your Google sign-in was successful, but we need an access code to complete your registration.",
      "pageSubtitle": "Complete Registration",
      "signedInAs": "Signed in as:",
      "enterCodeHint": "Enter your access code to complete account setup.",
      "submitButton": "Complete Registration",
      "submittingButton": "Completing Registration...",
      "successTitle": "Registration Complete!",
      "successMessage": "Your account has been set up successfully.",
      "redirectingToDashboard": "Redirecting to dashboard...",
      "wrongAccount": "Wrong account? Sign out and try again."
    },
    "success": {
      "pageSubtitle": "Registration Complete",
      "title": "Registration Successful!",
      "autoLoginMessage": "Logging you in automatically...",
      "oauthSuccessMessage": "Your account has been created successfully with Google OAuth. You will be redirected to the dashboard shortly.",
      "standardSuccessMessage": "Your account has been created successfully. You can now log in to access all FAQBNB features.",
      "setupCompleteTitle": "Account Setup Complete:",
      "setupItem1": "User account created",
      "setupItem2": "Default account established",
      "setupItem3": "Admin privileges configured",
      "setupItem4": "Access code validated",
      "goToDashboard": "Go to Dashboard",
      "continueToLogin": "Continue to Login",
      "autoRedirectOAuth": "You will be automatically redirected to the dashboard in 2 seconds.",
      "autoRedirectStandard": "You will be automatically redirected to the login page in 5 seconds.",
      "autoLoginInProgress": "Automatic login in progress...",
      "autoLoginFailed": "Automatic login failed. Please use the manual buttons above."
    },
    "session": {
      "secureAccess": "Secure Access",
      "restrictedArea": "This area is restricted to authorized administrators only.",
      "accessLogged": "All access attempts are logged and monitored.",
      "secureRegistration": "Secure Registration",
      "registrationProtected": "Your registration is protected by access code validation.",
      "registrationLogged": "All registration attempts are logged and monitored."
    },
    "messages": {
      "loginSuccess": "Login successful! Redirecting...",
      "completingGoogleSignIn": "Completing Google sign-in...",
      "checkingAuth": "Checking authentication...",
      "validatingLink": "Validating registration link...",
      "completingRegistration": "Completing your registration...",
      "settingUpAccount": "Please wait while we set up your account.",
      "accountCreatedSuccess": "Account created successfully! Redirecting to dashboard...",
      "loadingAuth": "Loading authentication...",
      "completingAuth": "Completing authentication...",
      "loadingRegistration": "Loading registration page..."
    },
    "errors": {
      "authenticationFailed": "Authentication Failed",
      "registrationFailed": "Registration Failed",
      "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
      "accessDenied": "Access denied. Admin privileges are required.",
      "noUserReturned": "Login failed: No user returned",
      "noValidSession": "No valid session found. Please try logging in again.",
      "oauthRegistrationFailed": "OAuth registration failed: {error}. Please try logging in manually at the login page.",
      "autoLoginFailed": "Automatic login failed. Please use the manual login button.",
      "invalidRegistrationLink": "Invalid Registration Link",
      "linkNotValid": "The registration link you followed is not valid",
      "registrationLinkIssues": "Registration Link Issues",
      "checkRegistrationEmail": "Please check your registration email for the correct link, or contact support for assistance.",
      "alreadyRegistered": "Already Registered!",
      "tryLoggingIn": "Try logging in instead",
      "authExpired": "Authentication expired. Please try the registration process again.",
      "userAlreadyRegistered": "User already registered. Please try logging in instead.",
      "invalidRegistrationData": "Invalid registration data. Please check your information.",
      "registrationFailedGeneric": "Registration failed: {error}"
    },
    "validation": {
      "emailRequired": "Email is required",
      "emailInvalid": "Please enter a valid email address",
      "passwordRequired": "Password is required",
      "passwordTooShort": "Password must be at least {min} characters",
      "passwordMissingLowercase": "Password must contain at least one lowercase letter",
      "passwordMissingUppercase": "Password must contain at least one uppercase letter",
      "passwordMissingNumber": "Password must contain at least one number",
      "confirmPasswordRequired": "Please confirm your password",
      "passwordsMustMatch": "Passwords do not match",
      "fullNameTooShort": "Name must be at least 2 characters",
      "mustAgreeToTerms": "You must agree to the terms and conditions"
    },
    "logout": {
      "button": "Sign Out",
      "loggingOut": "Signing out..."
    }
  }
}
```

### Task 3.2: Replicate Structure for Other Language Files

**Objective:** Create the same `auth` namespace structure in all 5 non-English translation files

**Files to Update:**
- `/messages/fr.json` (French)
- `/messages/es.json` (Spanish)
- `/messages/de.json` (German)
- `/messages/nl.json` (Dutch)
- `/messages/it.json` (Italian)

**Action:** Copy the English structure with placeholder translations that maintain the same keys. Actual translations will be generated in subsequent tasks (Task 2A.9).

### Task 3.3: Validate Namespace Structure

**Objective:** Ensure the namespace structure is valid JSON and follows established patterns

**Validation Checks:**
1. JSON syntax validation
2. No duplicate keys
3. Consistent key naming convention
4. All interpolation variables use `{varName}` format
5. Structure matches other namespaces (common, dashboard, items, errors)

---

## 4. Authorized Files and Functions for Modification

### 4.1 Primary Files for Modification

| File Path | Modification Type | Description |
|-----------|-------------------|-------------|
| `/messages/en.json` | EXPAND | Expand existing `auth` namespace with comprehensive structure |
| `/messages/fr.json` | EXPAND | Add `auth` namespace with French translations |
| `/messages/es.json` | EXPAND | Add `auth` namespace with Spanish translations |
| `/messages/de.json` | EXPAND | Add `auth` namespace with German translations |
| `/messages/nl.json` | EXPAND | Add `auth` namespace with Dutch translations |
| `/messages/it.json` | EXPAND | Add `auth` namespace with Italian translations |

### 4.2 Scope Boundaries

**In Scope:**
- Creating/expanding the `auth` namespace in translation files
- Organizing keys into logical sub-namespaces
- Adding interpolation placeholders where needed
- Adding pluralization patterns where applicable (ICU format)

**Out of Scope (to be done in subsequent tasks):**
- Updating React components to use translation keys (Tasks 2A.2 - 2A.8)
- Generating professional translations (Task 2A.9)
- Testing auth flows in each language (Task 2A.10)

---

## 5. Dependencies

### 5.1 Prerequisites

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Epic 1 Complete | Blocking | Assumed Complete | next-intl setup, IntlProvider, translation infrastructure |
| Translation file structure | Reference | Exists | `/messages/*.json` files already exist |

### 5.2 Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 2A.2 | Update LoginPageContent.tsx | Uses keys created here |
| 2A.3 | Update LoginForm.tsx | Uses keys created here |
| 2A.4 | Update RegistrationForm.tsx | Uses keys created here |
| 2A.5 | Update GoogleOAuthButton.tsx | Uses keys created here |
| 2A.9 | Generate translations | Translates strings created here |

---

## 6. Acceptance Criteria Verification

| Criterion | How to Verify |
|-----------|---------------|
| Namespace structure exists for all login page strings | Check `auth.login.*` keys exist in en.json |
| Namespace includes all registration form fields | Check `auth.register.*` keys exist in en.json |
| Password reset and forgot password workflows covered | Check `auth.password.*` keys exist (if applicable) |
| OAuth and social login strings included | Check `auth.oauth.*` keys exist in en.json |
| Session management messages covered | Check `auth.session.*` keys exist in en.json |
| Authentication error messages comprehensive | Check `auth.errors.*` keys exist in en.json |
| Namespace follows established pattern | Compare structure to `common`, `dashboard` namespaces |
| All keys use semantic naming | Review key names for clarity and context |

---

## 7. Testing Approach

### 7.1 Static Validation

1. **JSON Syntax Check:** Run `JSON.parse()` on each translation file
2. **Key Consistency Check:** Verify all 6 language files have identical key structures
3. **Interpolation Check:** Verify `{varName}` placeholders are consistent across files

### 7.2 Manual Review

1. Review English text for completeness against source components
2. Verify key naming follows `{namespace}.{section}.{element}` pattern
3. Confirm no hardcoded strings remain unaccounted for

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing strings discovered later | Medium | Low | Namespace structure is extensible; keys can be added |
| Key naming inconsistencies | Low | Medium | Follow established patterns, document conventions |
| JSON syntax errors | Low | High | Validate JSON before committing |
| Interpolation variable mismatches | Low | Medium | Review all `{variable}` patterns for consistency |

---

## 9. Implementation Notes

### 9.1 Key Naming Conventions

- Use camelCase for all keys
- Group related keys under common prefixes
- Use descriptive names: `submitButton` not `btn1`
- Include context in names: `emailPlaceholder` not just `placeholder`
- Use consistent suffixes: `*Label`, `*Placeholder`, `*Hint`, `*Button`, `*Message`

### 9.2 Interpolation Variables

Current interpolation patterns identified:
- `{minutes}` - for rate limiting messages
- `{error}` - for error message details
- `{min}` - for minimum character requirements

### 9.3 Pluralization Patterns (if needed)

Example ICU format for future use:
```json
"attemptCount": "{count, plural, one {# attempt} other {# attempts}}"
```

---

## 10. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Epic 1 Foundation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2A: Authentication & Registration*
