# REQ-E02-039: Create Authentication Namespace Structure for Translations - Detailed Task Breakdown

*Generated: 2026-01-20 12:30:00 UTC*
*Last Modified: 2026-01-20 12:30:00 UTC*

## Reference

- **Request**: REQ-E02-039 (Create Authentication Namespace Structure for Translations)
- **Source**: docs/gen_requests_epic2.md
- **Overview Document**: docs/REQ-E02-039-create-auth-namespace-structure-overview.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2A (Authentication & Registration)
- **Task ID**: 2A.1
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**: Epic 1 (L10N Foundation - next-intl setup)

---

## Summary

Expand the existing minimal `auth` namespace in `/messages/en.json` into a comprehensive, hierarchical structure covering all authentication-related UI strings. This includes login, registration, OAuth, password management, access codes, session management, error messages, and validation. The new structure will contain approximately 150+ keys organized into 12 logical subcategories.

---

## Current State Analysis

### Existing Auth Namespace (18 keys, flat structure)

The current `/messages/en.json` contains these `auth` keys:
```json
{
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
}
```

### Target State (~150 keys, categorized structure)

Transform into 12 subcategories:
- `auth.login` (~14 keys) - Login page strings
- `auth.register` (~12 keys) - Registration form strings
- `auth.passwordStrength` (~12 keys) - Password strength indicators
- `auth.passwordMatch` (~2 keys) - Password match feedback
- `auth.terms` (~4 keys) - Terms and privacy links
- `auth.oauth` (~10 keys) - OAuth/Google authentication
- `auth.accessCode` (~6 keys) - Access code validation
- `auth.complete` (~10 keys) - Complete registration page
- `auth.success` (~16 keys) - Registration success page
- `auth.session` (~6 keys) - Session management
- `auth.messages` (~10 keys) - Status and feedback messages
- `auth.errors` (~20 keys) - Authentication error messages
- `auth.validation` (~10 keys) - Form validation messages
- `auth.logout` (~2 keys) - Logout strings

---

## Detailed Tasks

### Task 1: Analyze Authentication Components for String Extraction
**Estimate**: 1 story point
**Priority**: P0 - Must do first

#### Description
Review all authentication-related components to create a complete inventory of hardcoded strings that need translation keys.

#### Files to Analyze

| File | Location | Estimated Strings |
|------|----------|-------------------|
| LoginPageContent | `/src/app/login/LoginPageContent.tsx` | ~35 |
| LoginForm | `/src/components/LoginForm.tsx` | ~25 |
| RegistrationForm | `/src/components/RegistrationForm.tsx` | ~50 |
| GoogleOAuthButton | `/src/components/GoogleOAuthButton.tsx` | ~10 |
| Registration Success | `/src/app/register/success/page.tsx` | ~25 |
| Complete Registration | `/src/app/register/complete/page.tsx` | ~30 |

#### Acceptance Criteria
- [ ] All hardcoded strings identified in each component
- [ ] Strings categorized by type (labels, messages, errors, etc.)
- [ ] Key naming convention established for each string
- [ ] No user-visible strings missed

#### String Inventory from Components

**LoginPageContent.tsx:**
- "Sign in to your account"
- "Access the FAQBNB administration panel"
- "FAQBNB"
- "Admin Access"
- "Completing authentication..."
- "Loading authentication..."
- "Login successful! Redirecting..."
- "Completing Google sign-in..."
- "Back to Home"
- "Clear Session"
- "Secure Access"
- "This area is restricted to authorized administrators only."
- "All access attempts are logged and monitored."

**LoginForm.tsx:**
- "Authentication Failed"
- "Sign in with your account"
- "Or continue with email"
- "Email Address"
- "admin@faqbnb.com" (placeholder)
- "Password"
- "Enter your password" (placeholder)
- "Email is required"
- "Please enter a valid email address"
- "Password is required"
- "Password must be at least 6 characters"
- "Invalid email or password. Please check your credentials and try again."
- "Access denied. Admin privileges are required."
- "Login failed: No user returned"
- "Remember me for 30 days"
- "Signing In..."
- "Sign In with Email"
- "Access restricted to authorized administrators only"

**RegistrationForm.tsx:**
- "Registration Failed"
- "Access code:"
- "Email Address"
- "This email is linked to your access code and cannot be changed."
- "Choose how to create your account"
- "Continue with Google"
- "Quick sign-up using your Google account"
- "Sign up with email"
- "Create a password for your account"
- "Enter your details below"
- "Full Name"
- "(optional)"
- "John Doe" (placeholder)
- "Password"
- "Create a strong password" (placeholder)
- "Password strength:"
- "Very Weak", "Weak", "Fair", "Good", "Strong"
- "Requirements:"
- "At least 8 characters"
- "One lowercase letter"
- "One uppercase letter"
- "One number"
- "One special character"
- "Confirm Password"
- "Confirm your password" (placeholder)
- "Passwords match"
- "Passwords do not match"
- "I agree to the"
- "Terms of Service"
- "and"
- "Privacy Policy"
- "Connecting to Google..."
- "Create Account"
- "Creating Account..."
- "Your account will be linked to your verified access code"

**Registration Success Page:**
- "Registration Complete"
- "Registration Successful!"
- "Logging you in automatically..."
- "Your account has been created successfully with Google OAuth."
- "You will be redirected to the dashboard shortly."
- "Your account has been created successfully."
- "You can now log in to access all FAQBNB features."
- "Account Setup Complete:"
- "User account created"
- "Default account established"
- "Admin privileges configured"
- "Access code validated"
- "Go to Dashboard"
- "Continue to Login"
- "Back to Home"
- "Automatic login in progress..."
- "Automatic login failed. Please use the manual buttons above."
- "You will be automatically redirected to the dashboard in 2 seconds."
- "You will be automatically redirected to the login page in 5 seconds."

**Complete Registration Page:**
- "Complete Registration"
- "Almost there!"
- "Your Google sign-in was successful, but we need an access code to complete your registration."
- "Signed in as:"
- "Enter your access code to complete account setup."
- "Access Code"
- "Enter your access code" (placeholder)
- "Check your email for the access code from your invitation."
- "Completing Registration..."
- "Complete Registration"
- "Registration Complete!"
- "Your account has been set up successfully."
- "Redirecting to dashboard..."
- "Wrong account? Sign out and try again."
- "Request Access Code"
- "Checking authentication..."
- "No valid session found. Please try logging in again."

**GoogleOAuthButton.tsx:**
- "Continue with Google"
- "Connecting to Google..."
- "Too many authentication attempts. Please try again in {minutes} minutes."

---

### Task 2: Create `auth.login` Subcategory
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Create the `login` subcategory containing all login page strings.

#### Target Content (14 keys)

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
      "submittingButton": "Signing In...",
      "rememberMe": "Remember me for 30 days",
      "dividerText": "Or continue with email",
      "accessRestricted": "Access restricted to authorized administrators only",
      "backToHome": "Back to Home",
      "clearSession": "Clear Session"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 14 login keys are present
- [ ] Key names follow camelCase convention
- [ ] Placeholders include `*Placeholder` suffix
- [ ] Button states differentiated (submitButton vs submittingButton)

#### Verification Steps
1. Verify JSON is valid after edit
2. Count keys in `auth.login` (should be 14)
3. Cross-reference with LoginPageContent.tsx and LoginForm.tsx

---

### Task 3: Create `auth.register` Subcategory
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Create the `register` subcategory containing registration form strings.

#### Target Content (12 keys)

```json
{
  "auth": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All registration form keys are present
- [ ] Labels distinguished from placeholders
- [ ] Hint text clearly named with `*Hint` suffix
- [ ] Button states differentiated

---

### Task 4: Create `auth.passwordStrength` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `passwordStrength` subcategory for password strength indicators.

#### Target Content (12 keys)

```json
{
  "auth": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 12 password strength keys are present
- [ ] Strength levels properly ordered (veryWeak to strong)
- [ ] Requirements match actual validation logic in RegistrationForm.tsx

---

### Task 5: Create `auth.passwordMatch` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `passwordMatch` subcategory for password confirmation feedback.

#### Target Content (2 keys)

```json
{
  "auth": {
    "passwordMatch": {
      "match": "Passwords match",
      "noMatch": "Passwords do not match"
    }
  }
}
```

#### Acceptance Criteria
- [ ] Both match states covered
- [ ] Messages are clear and user-friendly

---

### Task 6: Create `auth.terms` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `terms` subcategory for terms and privacy links.

#### Target Content (4 keys)

```json
{
  "auth": {
    "terms": {
      "agreeTo": "I agree to the",
      "termsOfService": "Terms of Service",
      "and": "and",
      "privacyPolicy": "Privacy Policy"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 4 terms keys are present
- [ ] Connector word "and" is separate for flexibility
- [ ] Link text properly isolated for styling

---

### Task 7: Create `auth.oauth` Subcategory
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Create the `oauth` subcategory for OAuth/Google authentication strings.

#### Target Content (10 keys)

```json
{
  "auth": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 10 OAuth keys are present
- [ ] Variable interpolation uses `{minutes}` format
- [ ] Registration method descriptions are clear

---

### Task 8: Create `auth.accessCode` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `accessCode` subcategory for access code validation strings.

#### Target Content (6 keys)

```json
{
  "auth": {
    "accessCode": {
      "label": "Access Code",
      "placeholder": "Enter your access code",
      "infoPrefix": "Access code:",
      "verified": "Access code verified:",
      "checkEmailHint": "Check your email for the access code from your invitation.",
      "requestNew": "Request New Access",
      "requestAccessCode": "Request Access Code"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All access code keys are present
- [ ] Hint provides clear user guidance

---

### Task 9: Create `auth.complete` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `complete` subcategory for the complete registration page strings.

#### Target Content (10 keys)

```json
{
  "auth": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All complete registration keys are present
- [ ] Success state messages included
- [ ] Button states differentiated

---

### Task 10: Create `auth.success` Subcategory
**Estimate**: 2 story points
**Priority**: P1 - High

#### Description
Create the `success` subcategory for the registration success page strings.

#### Target Content (16 keys)

```json
{
  "auth": {
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
      "backToHome": "Back to Home",
      "autoRedirectOAuth": "You will be automatically redirected to the dashboard in 2 seconds.",
      "autoRedirectStandard": "You will be automatically redirected to the login page in 5 seconds.",
      "autoLoginInProgress": "Automatic login in progress...",
      "autoLoginFailed": "Automatic login failed. Please use the manual buttons above."
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 16 success page keys are present
- [ ] OAuth and standard flows differentiated
- [ ] Setup completion checklist items included

---

### Task 11: Create `auth.session` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `session` subcategory for session management strings.

#### Target Content (6 keys)

```json
{
  "auth": {
    "session": {
      "secureAccess": "Secure Access",
      "restrictedArea": "This area is restricted to authorized administrators only.",
      "accessLogged": "All access attempts are logged and monitored.",
      "secureRegistration": "Secure Registration",
      "registrationProtected": "Your registration is protected by access code validation.",
      "registrationLogged": "All registration attempts are logged and monitored."
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 6 session keys are present
- [ ] Security messages are clear and professional

---

### Task 12: Create `auth.messages` Subcategory
**Estimate**: 1 story point
**Priority**: P1 - High

#### Description
Create the `messages` subcategory for status and feedback messages.

#### Target Content (10 keys)

```json
{
  "auth": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All 10 message keys are present
- [ ] Loading states include ellipsis
- [ ] Messages are user-friendly and informative

---

### Task 13: Create `auth.errors` Subcategory
**Estimate**: 2 story points
**Priority**: P0 - Critical

#### Description
Create the `errors` subcategory for authentication error messages with variable interpolation.

#### Target Content (20 keys)

```json
{
  "auth": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All error keys are present
- [ ] Variable interpolation uses `{error}` format
- [ ] Messages are user-friendly and actionable
- [ ] No duplicate error messages with `errors` namespace

---

### Task 14: Create `auth.validation` Subcategory
**Estimate**: 1 story point
**Priority**: P0 - Critical

#### Description
Create the `validation` subcategory for form validation messages with variable interpolation.

#### Target Content (10 keys)

```json
{
  "auth": {
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
    }
  }
}
```

#### Acceptance Criteria
- [ ] All validation keys are present
- [ ] Variable interpolation uses `{min}` format
- [ ] Messages match validation logic in components

---

### Task 15: Create `auth.logout` Subcategory
**Estimate**: 1 story point
**Priority**: P2 - Medium

#### Description
Create the `logout` subcategory for logout-related strings.

#### Target Content (2 keys)

```json
{
  "auth": {
    "logout": {
      "button": "Sign Out",
      "loggingOut": "Signing out..."
    }
  }
}
```

#### Acceptance Criteria
- [ ] Both logout states covered
- [ ] Consistent with existing auth.signOut key (migrate to new structure)

---

### Task 16: Clean Up Root Level and Migrate Existing Keys
**Estimate**: 1 story point
**Priority**: P0 - Critical (must be done last)

#### Description
Remove flat auth keys that have been reorganized into subcategories.

#### Keys to Remove from Root Level

```
signIn, signOut, confirmLogout, confirmSignOutMessage, signUp, email, password,
forgotPassword, resetPassword, continueWithGoogle, rememberMe, noAccount, hasAccount,
createAccount, verifyEmail, resendVerification, welcomeBack, loggedInAs
```

#### Migration Mapping

| Old Key | New Location | Notes |
|---------|--------------|-------|
| `signIn` | `login.submitButton` | Renamed for context |
| `signOut` | `logout.button` | Moved to logout subcategory |
| `confirmLogout` | (move to common.confirmation or keep) | Optional |
| `confirmSignOutMessage` | (move to common.confirmation or keep) | Optional |
| `signUp` | `register.submitButton` | Renamed for context |
| `email` | `login.emailLabel` / `register.emailLabel` | Split by context |
| `password` | `login.passwordLabel` / `register.passwordLabel` | Split by context |
| `forgotPassword` | (keep for future use) | May need separate subcategory |
| `resetPassword` | (keep for future use) | May need separate subcategory |
| `continueWithGoogle` | `oauth.continueWithGoogle` | Moved |
| `rememberMe` | `login.rememberMe` | Moved and expanded |
| `noAccount` | `register.alreadyHaveAccount` | Inverted for registration |
| `hasAccount` | (add to login if needed) | |
| `createAccount` | `register.submitButton` | Consolidated |
| `verifyEmail` | (keep for future email verification) | |
| `resendVerification` | (keep for future email verification) | |
| `welcomeBack` | (add to login.welcomeBack if needed) | |
| `loggedInAs` | `complete.signedInAs` | Moved |

#### Acceptance Criteria
- [ ] All flat keys removed from `auth` root
- [ ] Only subcategory objects remain
- [ ] JSON remains valid
- [ ] Build passes without errors

---

### Task 17: Update Non-English Language Files with Structure
**Estimate**: 1 story point
**Priority**: P2 - Required but separate

#### Description
Apply the same hierarchical structure to all 5 non-English language files using English placeholders.

#### Files to Update
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

#### Acceptance Criteria
- [ ] All 5 files have identical `auth` structure to `en.json`
- [ ] All keys present in `en.json` exist in other files
- [ ] Values are English placeholders (will be translated in Task 2A.9)
- [ ] All files are valid JSON

---

### Task 18: Validate Complete Implementation
**Estimate**: 1 story point
**Priority**: P0 - Must do last

#### Description
Final validation to ensure all acceptance criteria are met.

#### Checklist

**Structure Validation**
- [ ] `auth.login` exists with ~14 keys
- [ ] `auth.register` exists with ~16 keys
- [ ] `auth.passwordStrength` exists with 12 keys
- [ ] `auth.passwordMatch` exists with 2 keys
- [ ] `auth.terms` exists with 4 keys
- [ ] `auth.oauth` exists with ~10 keys
- [ ] `auth.accessCode` exists with ~7 keys
- [ ] `auth.complete` exists with ~11 keys
- [ ] `auth.success` exists with ~17 keys
- [ ] `auth.session` exists with 6 keys
- [ ] `auth.messages` exists with ~10 keys
- [ ] `auth.errors` exists with ~18 keys
- [ ] `auth.validation` exists with ~11 keys
- [ ] `auth.logout` exists with 2 keys

**Variable Interpolation Validation**
- [ ] `auth.oauth.tooManyAttempts` uses `{minutes}` correctly
- [ ] `auth.errors.oauthRegistrationFailed` uses `{error}` correctly
- [ ] `auth.errors.registrationFailedGeneric` uses `{error}` correctly
- [ ] `auth.validation.passwordTooShort` uses `{min}` correctly

**JSON Validation**
- [ ] `/messages/en.json` is valid JSON
- [ ] All 6 language files have consistent `auth` structure
- [ ] No duplicate keys within any namespace

**Build Validation**
- [ ] `npm run build` succeeds without errors
- [ ] Application starts without i18n errors

#### Verification Commands
```bash
# Validate JSON files
npx jsonlint messages/en.json
npx jsonlint messages/fr.json
npx jsonlint messages/es.json
npx jsonlint messages/de.json
npx jsonlint messages/nl.json
npx jsonlint messages/it.json

# Build project
npm run build

# Start dev server and check console
npm run dev
```

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `/messages/en.json` | Modify | Expand `auth` namespace with 14 subcategories |
| `/messages/fr.json` | Modify | Mirror structure with English placeholders |
| `/messages/es.json` | Modify | Mirror structure with English placeholders |
| `/messages/de.json` | Modify | Mirror structure with English placeholders |
| `/messages/nl.json` | Modify | Mirror structure with English placeholders |
| `/messages/it.json` | Modify | Mirror structure with English placeholders |

---

## Files NOT to Modify

- `/src/app/login/LoginPageContent.tsx` - Will be updated in Task 2A.2
- `/src/components/LoginForm.tsx` - Will be updated in Task 2A.3
- `/src/components/RegistrationForm.tsx` - Will be updated in Task 2A.4
- `/src/components/GoogleOAuthButton.tsx` - Will be updated in Task 2A.5
- `/src/app/register/page.tsx` - Will be updated in Task 2A.6
- `/src/app/register/success/page.tsx` - Will be updated in Task 2A.7
- `/src/app/register/complete/page.tsx` - Will be updated in Task 2A.8

---

## Final Target Structure

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
      "submittingButton": "Signing In...",
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
      "backToHome": "Back to Home",
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

---

## Usage Examples After Implementation

### Client Component - Login Form
```typescript
'use client';
import { useTranslations } from 'next-intl';

function LoginForm() {
  const t = useTranslations('auth');

  return (
    <form>
      <h2>{t('login.title')}</h2>
      <p>{t('login.subtitle')}</p>

      <label>{t('login.emailLabel')}</label>
      <input placeholder={t('login.emailPlaceholder')} />

      <label>{t('login.passwordLabel')}</label>
      <input placeholder={t('login.passwordPlaceholder')} />

      <button type="submit">{t('login.submitButton')}</button>
    </form>
  );
}
```

### With Scoped Namespace
```typescript
'use client';
import { useTranslations } from 'next-intl';

function PasswordStrengthIndicator({ score }) {
  const t = useTranslations('auth.passwordStrength');

  const labels = ['veryWeak', 'weak', 'fair', 'good', 'strong'];

  return (
    <div>
      <span>{t('label')}</span>
      <span>{t(labels[score])}</span>
    </div>
  );
}
```

### With Variable Interpolation
```typescript
'use client';
import { useTranslations } from 'next-intl';

function RateLimitMessage({ minutes }) {
  const t = useTranslations('auth.oauth');

  return (
    <p>{t('tooManyAttempts', { minutes })}</p>
  );
}
```

---

## Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Component breakage from key changes | High | Medium | Components updated in subsequent tasks (2A.2-2A.8) |
| Variable interpolation syntax errors | Medium | Low | Validate with next-intl before committing |
| Missing keys in non-English files | Low | Low | Script to compare structures between files |
| JSON parse errors | Low | High | Use jsonlint validation before committing |
| Overlap with `errors` namespace | Medium | Medium | Carefully scope auth.errors vs errors namespace |

---

## Dependencies

### Required (Already Available)
- `next-intl` package installed (Epic 1)
- Translation files exist at `/messages/*.json` (Epic 1)
- IntlProvider configured in layout (Epic 1)

### No New Dependencies
This task only modifies JSON translation files.

---

## Story Points Summary

| Task | Story Points |
|------|--------------|
| Task 1: Analyze Authentication Components | 1 |
| Task 2: Create `auth.login` | 1 |
| Task 3: Create `auth.register` | 1 |
| Task 4: Create `auth.passwordStrength` | 1 |
| Task 5: Create `auth.passwordMatch` | 1 |
| Task 6: Create `auth.terms` | 1 |
| Task 7: Create `auth.oauth` | 1 |
| Task 8: Create `auth.accessCode` | 1 |
| Task 9: Create `auth.complete` | 1 |
| Task 10: Create `auth.success` | 2 |
| Task 11: Create `auth.session` | 1 |
| Task 12: Create `auth.messages` | 1 |
| Task 13: Create `auth.errors` | 2 |
| Task 14: Create `auth.validation` | 1 |
| Task 15: Create `auth.logout` | 1 |
| Task 16: Clean Up Root Level | 1 |
| Task 17: Update Non-English Files | 1 |
| Task 18: Validate Implementation | 1 |
| **Total** | **20 SP** |

**Estimated Completion**: 1-2 days (tasks can be done in sequence as editing sessions)

---

## Related Tasks (Subsequent)

| Task ID | Title | Uses Keys From |
|---------|-------|----------------|
| 2A.2 | Update LoginPageContent.tsx | auth.login, auth.session, auth.messages |
| 2A.3 | Update LoginForm.tsx | auth.login, auth.oauth, auth.validation, auth.errors |
| 2A.4 | Update RegistrationForm.tsx | auth.register, auth.passwordStrength, auth.terms, auth.oauth, auth.validation, auth.errors |
| 2A.5 | Update GoogleOAuthButton.tsx | auth.oauth |
| 2A.6 | Update Register page.tsx | auth.register |
| 2A.7 | Update Registration Success page | auth.success |
| 2A.8 | Update Complete Registration page | auth.complete, auth.accessCode |
| 2A.9 | Generate translations for 5 languages | All auth.* keys |
| 2A.10 | Test auth flows in each language | All auth.* keys |

---

*End of Detailed Task Breakdown*
