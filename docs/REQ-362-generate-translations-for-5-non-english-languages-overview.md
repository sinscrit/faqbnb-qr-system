# REQ-362: Generate Translations for 5 Non-English Languages (Authentication Namespace)

**Created:** 2026-01-19 12:30 UTC
**Last Modified:** 2026-01-19 12:30 UTC
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.9
**Type:** ENHANCEMENT
**Size:** L (Large)
**Priority:** High

---

## Overview

This task completes the internationalization of the authentication and registration flows by generating high-quality translations for all authentication-related UI strings in the five non-English languages: German (de), Spanish (es), French (fr), Italian (it), and Dutch (nl).

### Context

The authentication components (LoginForm, RegistrationForm, GoogleOAuthButton, LoginPageContent, and registration success/complete pages) contain numerous hardcoded UI strings that need to be translated. The English source file (`messages/en.json`) contains the `auth` namespace with base translations, but the other language files only have a basic subset (~19 auth-related keys each). The full authentication flow requires significantly more strings covering:

- Login form labels, placeholders, and error messages
- Registration form with password strength indicators
- OAuth flow states and messages
- Success/completion page content
- Error handling and validation feedback

---

## Current State Analysis

### Existing Translation Structure

**English (`messages/en.json`) auth namespace - 19 keys:**
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

### Strings Requiring Translation (Identified from Components)

Based on analysis of authentication components, the following additional strings need to be added and translated:

#### From LoginForm.tsx (~25 strings)
- "Email is required"
- "Please enter a valid email address"
- "Password is required"
- "Password must be at least 6 characters"
- "Authentication Failed"
- "Invalid email or password. Please check your credentials and try again."
- "Access denied. Admin privileges are required."
- "Sign in with your account"
- "Or continue with email"
- "Email Address"
- "Enter your password"
- "Remember me for 30 days"
- "Signing In..."
- "Sign In with Email"
- "Access restricted to authorized administrators only"

#### From RegistrationForm.tsx (~45 strings)
- "Registration Failed"
- "Access code:"
- "This email is linked to your access code and cannot be changed."
- "Choose how to create your account"
- "Continue with Google" / "Quick sign-up using your Google account"
- "Sign up with email" / "Create a password for your account"
- "Enter your details below"
- "Full Name" / "(optional)"
- "Create a strong password"
- "Password strength:" / "Very Weak" / "Weak" / "Fair" / "Good" / "Strong"
- "Requirements:"
- "At least 8 characters" / "One lowercase letter" / "One uppercase letter" / "One number" / "One special character"
- "Confirm Password" / "Confirm your password"
- "Passwords match" / "Passwords do not match"
- "I agree to the" / "Terms of Service" / "and" / "Privacy Policy"
- "Creating Account..." / "Connecting to Google..."
- "Your account will be linked to your verified access code"

#### From LoginPageContent.tsx (~15 strings)
- "Admin Access"
- "Sign in to your account"
- "Access the FAQBNB administration panel"
- "Completing authentication..."
- "Loading authentication..."
- "Login successful! Redirecting..."
- "Completing Google sign-in..."
- "Back to Home"
- "Clear Session"
- "Secure Access"
- "This area is restricted to authorized administrators only. All access attempts are logged and monitored."

#### From GoogleOAuthButton.tsx (~3 strings)
- "Connecting to Google..."
- "Too many authentication attempts. Please try again in {minutes} minutes."

#### From register/success/page.tsx (~20 strings)
- "Registration Complete"
- "Registration Successful!"
- "Logging you in automatically..."
- "Automatic login failed. Please use the manual login button."
- "Your account has been created successfully with Google OAuth."
- "You will be redirected to the dashboard shortly."
- "Your account has been created successfully."
- "You can now log in to access all FAQBNB features."
- "Account Setup Complete:"
- "User account created" / "Default account established" / "Admin privileges configured" / "Access code validated"
- "Go to Dashboard" / "Continue to Login"
- "Automatic login in progress..."
- "You will be automatically redirected to the dashboard in 2 seconds."
- "You will be automatically redirected to the login page in 5 seconds."

#### From register/complete/page.tsx (~20 strings)
- "Complete Registration"
- "Almost there!"
- "Your Google sign-in was successful, but we need an access code to complete your registration."
- "Signed in as:"
- "Enter your access code to complete account setup."
- "Access Code"
- "Enter your access code"
- "Check your email for the access code from your invitation."
- "Completing Registration..."
- "Complete Registration"
- "Wrong account? Sign out and try again."
- "Request Access Code"
- "Registration Complete!"
- "Your account has been set up successfully."
- "Redirecting to dashboard..."
- "Checking authentication..."
- "No valid session found. Please try logging in again."

---

## Implementation Approach

### 1. Expand English Source File

First, add all identified strings to `messages/en.json` with a properly structured `auth` namespace:

```json
{
  "auth": {
    "login": {
      "title": "Sign in to your account",
      "subtitle": "Access the FAQBNB administration panel",
      "adminAccess": "Admin Access",
      "emailLabel": "Email Address",
      "emailPlaceholder": "admin@faqbnb.com",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Enter your password",
      "rememberMe": "Remember me for 30 days",
      "submitButton": "Sign In with Email",
      "signingIn": "Signing In...",
      "googleButton": "Continue with Google",
      "connectingGoogle": "Connecting to Google...",
      "signInWith": "Sign in with your account",
      "orContinueWithEmail": "Or continue with email",
      "accessRestricted": "Access restricted to authorized administrators only",
      "completingAuth": "Completing authentication...",
      "loadingAuth": "Loading authentication...",
      "successRedirecting": "Login successful! Redirecting...",
      "completingGoogleSignIn": "Completing Google sign-in..."
    },
    "register": {
      "title": "Create your account",
      "accessCodeInfo": "Access code:",
      "emailLinked": "This email is linked to your access code and cannot be changed.",
      "chooseMethod": "Choose how to create your account",
      "googleOption": "Continue with Google",
      "googleDescription": "Quick sign-up using your Google account",
      "emailOption": "Sign up with email",
      "emailDescription": "Create a password for your account",
      "enterDetails": "Enter your details below",
      "fullName": "Full Name",
      "optional": "(optional)",
      "passwordCreate": "Create a strong password",
      "confirmPassword": "Confirm Password",
      "confirmPasswordPlaceholder": "Confirm your password",
      "termsAgree": "I agree to the",
      "termsOfService": "Terms of Service",
      "and": "and",
      "privacyPolicy": "Privacy Policy",
      "creatingAccount": "Creating Account...",
      "accountLinked": "Your account will be linked to your verified access code"
    },
    "password": {
      "strengthLabel": "Password strength:",
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
      "special": "One special character",
      "match": "Passwords match",
      "noMatch": "Passwords do not match"
    },
    "errors": {
      "authFailed": "Authentication Failed",
      "registrationFailed": "Registration Failed",
      "emailRequired": "Email is required",
      "invalidEmail": "Please enter a valid email address",
      "passwordRequired": "Password is required",
      "passwordTooShort": "Password must be at least 6 characters",
      "passwordMinChars": "Password must be at least 8 characters",
      "passwordNeedsLower": "Password must contain at least one lowercase letter",
      "passwordNeedsUpper": "Password must contain at least one uppercase letter",
      "passwordNeedsNumber": "Password must contain at least one number",
      "confirmRequired": "Please confirm your password",
      "passwordMismatch": "Passwords do not match",
      "nameMinChars": "Name must be at least 2 characters",
      "termsRequired": "You must agree to the terms and conditions",
      "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
      "accessDenied": "Access denied. Admin privileges are required.",
      "tooManyAttempts": "Too many authentication attempts. Please try again in {minutes} minutes.",
      "autoLoginFailed": "Automatic login failed. Please use the manual login button.",
      "noSession": "No valid session found. Please try logging in again."
    },
    "success": {
      "title": "Registration Successful!",
      "pageTitle": "Registration Complete",
      "loggingIn": "Logging you in automatically...",
      "accountCreatedOAuth": "Your account has been created successfully with Google OAuth.",
      "redirectToDashboard": "You will be redirected to the dashboard shortly.",
      "accountCreated": "Your account has been created successfully.",
      "canNowLogin": "You can now log in to access all FAQBNB features.",
      "setupComplete": "Account Setup Complete:",
      "userCreated": "User account created",
      "accountEstablished": "Default account established",
      "adminConfigured": "Admin privileges configured",
      "codeValidated": "Access code validated",
      "goToDashboard": "Go to Dashboard",
      "continueToLogin": "Continue to Login",
      "autoLoginProgress": "Automatic login in progress...",
      "redirectDashboard2s": "You will be automatically redirected to the dashboard in 2 seconds.",
      "redirectLogin5s": "You will be automatically redirected to the login page in 5 seconds.",
      "registrationComplete": "Registration Complete!",
      "accountSetupSuccess": "Your account has been set up successfully.",
      "redirectingDashboard": "Redirecting to dashboard..."
    },
    "complete": {
      "title": "Complete Registration",
      "almostThere": "Almost there!",
      "needsAccessCode": "Your Google sign-in was successful, but we need an access code to complete your registration.",
      "signedInAs": "Signed in as:",
      "enterCodeToComplete": "Enter your access code to complete account setup.",
      "accessCodeLabel": "Access Code",
      "accessCodePlaceholder": "Enter your access code",
      "checkEmail": "Check your email for the access code from your invitation.",
      "completing": "Completing Registration...",
      "completeButton": "Complete Registration",
      "wrongAccount": "Wrong account? Sign out and try again.",
      "requestAccessCode": "Request Access Code",
      "checkingAuth": "Checking authentication..."
    },
    "common": {
      "backToHome": "Back to Home",
      "clearSession": "Clear Session",
      "secureAccess": "Secure Access",
      "secureAccessDesc": "This area is restricted to authorized administrators only. All access attempts are logged and monitored."
    },
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

### 2. Generate Translations

For each target language, generate contextually appropriate translations considering:

- **Formal vs. informal address**: Use formal "vous" (French), "Sie" (German), "usted" (Spanish), "Lei" (Italian), "u" (Dutch) for business/administrative context
- **Technical terms**: Keep "Google", "OAuth", "email" recognizable; translate "password", "account", etc.
- **Text expansion**: German and Dutch may expand 20-40% compared to English
- **Cultural conventions**: Adapt time format expressions, date references appropriately
- **ICU message format**: Preserve placeholders like `{minutes}` in correct grammatical position

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Purpose | Changes |
|-----------|---------|---------|
| `/messages/en.json` | English source translations | Expand `auth` namespace with nested structure (~100 new keys) |
| `/messages/de.json` | German translations | Add complete `auth` namespace translations |
| `/messages/es.json` | Spanish translations | Add complete `auth` namespace translations |
| `/messages/fr.json` | French translations | Add complete `auth` namespace translations |
| `/messages/it.json` | Italian translations | Add complete `auth` namespace translations |
| `/messages/nl.json` | Dutch translations | Add complete `auth` namespace translations |

### JSON Structure to Add/Update

Each translation file must maintain identical key structure:
- `auth.login.*` - Login page strings
- `auth.register.*` - Registration form strings
- `auth.password.*` - Password strength/validation strings
- `auth.errors.*` - Error messages
- `auth.success.*` - Success page strings
- `auth.complete.*` - Complete registration page strings
- `auth.common.*` - Shared auth UI elements
- `auth.*` (flat) - Existing keys for backward compatibility

---

## Translation Guidelines

### German (de)
- Use formal "Sie" address
- "Anmelden" for login, "Registrieren" for register
- Compound nouns may be longer (plan for text expansion)

### Spanish (es)
- Use formal "usted" address
- "Iniciar sesión" for login, "Registrarse" for register
- Gender-neutral where possible

### French (fr)
- Use formal "vous" address
- "Se connecter" for login, "S'inscrire" for register
- Proper accent handling (é, è, ê, etc.)

### Italian (it)
- Use formal "Lei" address
- "Accedi" for login, "Registrati" for register
- Proper accent handling

### Dutch (nl)
- Use formal "u" address
- "Inloggen" for login, "Registreren" for register
- Similar structure to German

---

## Acceptance Criteria

- [ ] All 6 translation files contain identical `auth` namespace key structure
- [ ] German (de.json) contains complete, grammatically correct translations
- [ ] Spanish (es.json) contains complete, grammatically correct translations
- [ ] French (fr.json) contains complete, grammatically correct translations
- [ ] Italian (it.json) contains complete, grammatically correct translations
- [ ] Dutch (nl.json) contains complete, grammatically correct translations
- [ ] All JSON files are valid and properly formatted
- [ ] Placeholder variables like `{minutes}` are preserved in grammatically correct positions
- [ ] Formal address (vous/Sie/usted/Lei/u) used consistently
- [ ] No console warnings for missing translation keys when testing auth flows
- [ ] Text displays properly without overflow/truncation in UI components
- [ ] All translations maintain consistency with existing `common`, `errors`, and `language` namespaces

---

## Testing Verification

1. **Build Verification**: TypeScript compilation succeeds with no i18n-related errors
2. **Console Check**: No missing translation key warnings in browser console
3. **Visual Inspection**: Test all auth pages in each language:
   - `/login` - Login page
   - `/register` - Registration page (with access code)
   - `/register/success` - Success page
   - `/register/complete` - Complete registration page
4. **Form Validation**: Error messages display in correct language
5. **State Transitions**: Loading states, success messages, and redirects show translated text

---

## Dependencies

- **Depends On**: Tasks 2A.1-2A.8 (component internationalization must be complete)
- **Required By**: Epic 2 completion, QA validation

---

## Estimated Effort

- **String Count**: ~100 new keys per language file
- **Total Translations**: ~500 strings (100 keys × 5 languages)
- **Estimated Time**: 2-3 hours (with AI-assisted translation generation)
- **Complexity**: Medium (requires linguistic expertise for quality translations)

---

## Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation quality issues | Medium | Medium | Review by native speakers; maintain glossary |
| Missing keys causing runtime errors | Low | High | Verify key structure matches en.json exactly |
| Text overflow in UI | Medium | Low | Test all languages; design with 40% expansion buffer |
| Inconsistent terminology | Medium | Medium | Reference existing translations in common/errors namespaces |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [PRD: L10N Epic 2](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
