# REQ-355: Create Auth Namespace Structure in Translation Files - Implementation Overview

**Document Created:** 2026-01-19 06:15 UTC
**Last Modified:** 2026-01-19 06:15 UTC
**Request ID:** REQ-355
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2A - Authentication & Registration
**Task ID:** 2A.1
**Priority:** High (Third in recommended order after 2H Common and 2J Errors)
**Size:** S (Small)

---

## 1. Summary

Create a comprehensive `auth` namespace structure within all translation files (`/messages/*.json`) to centralize and organize all authentication and registration-related text strings. This foundational task establishes the translation key structure that subsequent Sub-Epic 2A tasks will reference when internationalizing the authentication components.

---

## 2. Current State Analysis

### 2.1 Existing Auth Namespace

The translation files currently contain a basic `auth` namespace with limited keys:

**Current `/messages/en.json` auth namespace (15 keys):**
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

### 2.2 Gaps Identified

The current namespace lacks strings for:
- Login page content (titles, subtitles, security notices)
- Login form validation messages
- Registration form fields and validation
- Password strength indicators and requirements
- OAuth flow messages (connecting, completing)
- Access code validation
- Registration success/complete page content
- Session management messages
- Detailed error messages specific to auth flows

### 2.3 Component String Inventory

**Components requiring auth translations (~150 strings total):**

| Component | Location | Estimated Strings |
|-----------|----------|-------------------|
| LoginPageContent | `/src/app/login/LoginPageContent.tsx` | ~40 |
| LoginForm | `/src/components/LoginForm.tsx` | ~30 |
| RegistrationForm | `/src/components/RegistrationForm.tsx` | ~50 |
| GoogleOAuthButton | `/src/components/GoogleOAuthButton.tsx` | ~10 |
| Register page | `/src/app/register/page.tsx` | ~5 |
| Registration success page | `/src/app/register/success/page.tsx` | ~25 |
| Registration complete page | `/src/app/register/complete/page.tsx` | ~30 |
| LogoutButton | `/src/components/LogoutButton.tsx` | ~5 (already using translations) |

---

## 3. Target State

### 3.1 Complete Auth Namespace Structure

The expanded `auth` namespace should follow this hierarchical structure:

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
      "signInWithAccount": "Sign in with your account",
      "orContinueWithEmail": "Or continue with email",
      "accessRestricted": "Access restricted to authorized administrators only",
      "backToHome": "Back to Home",
      "clearSession": "Clear Session",
      "loading": {
        "authenticating": "Completing authentication...",
        "loading": "Loading authentication..."
      },
      "messages": {
        "success": "Login successful! Redirecting...",
        "completingGoogle": "Completing Google sign-in..."
      },
      "security": {
        "title": "Secure Access",
        "description": "This area is restricted to authorized administrators only. All access attempts are logged and monitored."
      }
    },
    "register": {
      "title": "Create your account",
      "subtitle": "Join FAQBNB and start managing your properties",
      "loadingPage": "Loading registration page...",
      "accessCodeInfo": "Access code:",
      "emailLabel": "Email Address",
      "emailPlaceholder": "email@example.com",
      "emailLinked": "This email is linked to your access code and cannot be changed.",
      "fullNameLabel": "Full Name",
      "fullNamePlaceholder": "John Doe",
      "fullNameOptional": "(optional)",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Create a strong password",
      "confirmPasswordLabel": "Confirm Password",
      "confirmPasswordPlaceholder": "Confirm your password",
      "terms": {
        "agreeText": "I agree to the",
        "termsOfService": "Terms of Service",
        "and": "and",
        "privacyPolicy": "Privacy Policy"
      },
      "submitButton": "Create Account",
      "creatingAccount": "Creating Account...",
      "accountLinked": "Your account will be linked to your verified access code",
      "registrationFailed": "Registration Failed",
      "methodSelection": {
        "title": "Choose how to create your account",
        "googleOption": "Continue with Google",
        "googleDescription": "Quick sign-up using your Google account",
        "emailOption": "Sign up with email",
        "emailDescription": "Create a password for your account",
        "enterDetails": "Enter your details below"
      },
      "passwordStrength": {
        "label": "Password strength:",
        "enterPassword": "Enter password",
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
      }
    },
    "oauth": {
      "continueWithGoogle": "Continue with Google",
      "connectingToGoogle": "Connecting to Google...",
      "rateLimitError": "Too many authentication attempts. Please try again in {minutes} minutes."
    },
    "logout": {
      "button": "Sign Out",
      "confirmTitle": "Confirm Logout",
      "confirmMessage": "Are you sure you want to sign out?",
      "signingOut": "Signing out..."
    },
    "success": {
      "title": "Registration Successful!",
      "registrationComplete": "Registration Complete",
      "accountCreated": "Your account has been created successfully.",
      "accountCreatedOAuth": "Your account has been created successfully with Google OAuth. You will be redirected to the dashboard shortly.",
      "canNowLogin": "You can now log in to access all FAQBNB features.",
      "autoLoginInProgress": "Logging you in automatically...",
      "autoLoginFailed": "Automatic login failed. Please use the manual login button.",
      "setupComplete": "Account Setup Complete:",
      "setupItems": {
        "userCreated": "User account created",
        "accountEstablished": "Default account established",
        "adminConfigured": "Admin privileges configured",
        "accessValidated": "Access code validated"
      },
      "goToDashboard": "Go to Dashboard",
      "continueToLogin": "Continue to Login",
      "redirectToDashboard": "You will be automatically redirected to the dashboard in 2 seconds.",
      "redirectToLogin": "You will be automatically redirected to the login page in 5 seconds."
    },
    "complete": {
      "title": "Complete Registration",
      "almostThere": "Almost there!",
      "needAccessCode": "Your Google sign-in was successful, but we need an access code to complete your registration.",
      "signedInAs": "Signed in as:",
      "enterAccessCode": "Enter your access code to complete account setup.",
      "accessCodeLabel": "Access Code",
      "accessCodePlaceholder": "Enter your access code",
      "checkEmail": "Check your email for the access code from your invitation.",
      "completeButton": "Complete Registration",
      "completingRegistration": "Completing Registration...",
      "registrationComplete": "Registration Complete!",
      "accountSetup": "Your account has been set up successfully.",
      "redirectingToDashboard": "Redirecting to dashboard...",
      "wrongAccount": "Wrong account? Sign out and try again.",
      "requestAccessCode": "Request Access Code",
      "loading": "Loading...",
      "checkingAuth": "Checking authentication..."
    },
    "validation": {
      "emailRequired": "Email is required",
      "emailInvalid": "Please enter a valid email address",
      "passwordRequired": "Password is required",
      "passwordTooShort": "Password must be at least 6 characters",
      "passwordMinLength": "Password must be at least 8 characters",
      "passwordNeedsLowercase": "Password must contain at least one lowercase letter",
      "passwordNeedsUppercase": "Password must contain at least one uppercase letter",
      "passwordNeedsNumber": "Password must contain at least one number",
      "confirmPasswordRequired": "Please confirm your password",
      "passwordsMismatch": "Passwords do not match",
      "nameTooShort": "Name must be at least 2 characters",
      "termsRequired": "You must agree to the terms and conditions",
      "noSessionFound": "No valid session found. Please try logging in again."
    },
    "errors": {
      "authFailed": "Authentication Failed",
      "invalidCredentials": "Invalid email or password. Please check your credentials and try again.",
      "accessDenied": "Access denied. Admin privileges are required.",
      "loginFailed": "Login failed: No user returned",
      "registrationFailed": "Registration failed. Please try again.",
      "unexpectedError": "An unexpected error occurred",
      "unexpectedRegistrationError": "An unexpected error occurred during registration"
    },
    "accessCode": {
      "label": "Access Code",
      "placeholder": "Enter your access code",
      "validating": "Validating access code...",
      "invalid": "Invalid access code",
      "expired": "Access code has expired",
      "validationFailed": "Access code validation failed:"
    },
    "footer": {
      "copyright": "© {year} FAQBNB. All rights reserved."
    }
  }
}
```

### 3.2 Key Naming Conventions

Following the established pattern from the implementation plan:
- **Structure:** `auth.{category}.{element}.{variant?}`
- **Categories:** `login`, `register`, `oauth`, `logout`, `success`, `complete`, `validation`, `errors`, `accessCode`, `footer`
- **Clear, descriptive names** indicating usage context
- **Consistent casing:** camelCase for keys

---

## 4. Implementation Tasks

### Task 4.1: Expand English Translation File
**File:** `/messages/en.json`
**Action:** Replace current basic `auth` namespace with comprehensive structure

### Task 4.2: Update French Translation File
**File:** `/messages/fr.json`
**Action:** Add complete `auth` namespace with French translations

### Task 4.3: Update Spanish Translation File
**File:** `/messages/es.json`
**Action:** Add complete `auth` namespace with Spanish translations

### Task 4.4: Update German Translation File
**File:** `/messages/de.json`
**Action:** Add complete `auth` namespace with German translations

### Task 4.5: Update Dutch Translation File
**File:** `/messages/nl.json`
**Action:** Add complete `auth` namespace with Dutch translations

### Task 4.6: Update Italian Translation File
**File:** `/messages/it.json`
**Action:** Add complete `auth` namespace with Italian translations

---

## 5. Authorized Files and Functions for Modification

### 5.1 Translation Files (Primary)

| File Path | Modification Type | Notes |
|-----------|-------------------|-------|
| `/messages/en.json` | EXPAND | Replace basic auth namespace with comprehensive structure (~150 keys) |
| `/messages/fr.json` | EXPAND | Add French translations for new auth keys |
| `/messages/es.json` | EXPAND | Add Spanish translations for new auth keys |
| `/messages/de.json` | EXPAND | Add German translations for new auth keys |
| `/messages/nl.json` | EXPAND | Add Dutch translations for new auth keys |
| `/messages/it.json` | EXPAND | Add Italian translations for new auth keys |

### 5.2 Validation (No Changes Required)

These files are read-only for this task but should be referenced:

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/config.ts` | Verify supported locales match |
| `/src/app/login/LoginPageContent.tsx` | Extract string values |
| `/src/components/LoginForm.tsx` | Extract string values |
| `/src/components/RegistrationForm.tsx` | Extract string values |
| `/src/components/GoogleOAuthButton.tsx` | Extract string values |
| `/src/app/register/success/page.tsx` | Extract string values |
| `/src/app/register/complete/page.tsx` | Extract string values |

---

## 6. Dependencies

### 6.1 Prerequisites (Epic 1 Completed)
- ✅ next-intl package installed
- ✅ Translation files exist at `/messages/*.json`
- ✅ i18n configuration at `/src/lib/i18n/config.ts`
- ✅ Basic auth namespace already present

### 6.2 Downstream Dependencies
This task enables the following Sub-Epic 2A tasks:
- **Task 2A.2:** Update `/src/app/login/LoginPageContent.tsx`
- **Task 2A.3:** Update `/src/components/LoginForm.tsx`
- **Task 2A.4:** Update `/src/components/RegistrationForm.tsx`
- **Task 2A.5:** Update `/src/components/GoogleOAuthButton.tsx`
- **Task 2A.6-2A.8:** Update registration pages
- **Task 2A.9:** Generate translations (already included in this task)
- **Task 2A.10:** Test all auth flows

---

## 7. Acceptance Criteria Mapping

| Requirement | Implementation |
|-------------|----------------|
| Auth namespace includes all form labels | ✅ Included in `login`, `register`, `accessCode` categories |
| Auth namespace contains button labels | ✅ Included in `login.submitButton`, `register.submitButton`, `oauth.continueWithGoogle`, etc. |
| Auth namespace includes help text and instructions | ✅ Included in `register.passwordStrength`, `register.methodSelection`, `complete.*` |
| Auth namespace contains OAuth provider labels | ✅ Included in `oauth.*` category |
| Auth namespace includes error messages | ✅ Included in `validation.*` and `errors.*` categories |
| Auth namespace contains success messages | ✅ Included in `success.*` and `login.messages.*` categories |
| Auth namespace includes page titles and headings | ✅ Included in `login.title`, `register.title`, `success.title`, `complete.title` |
| Structure consistent across all six language files | Task requirement |
| All keys use clear, descriptive names | ✅ Following established naming convention |
| English version serves as source of truth | ✅ English file is primary reference |

---

## 8. Technical Notes

### 8.1 Existing LogoutButton Integration
The `LogoutButton` component already uses `useTranslations('auth')` and references:
- `t('confirmLogout')` → maps to `auth.confirmLogout`
- `t('confirmSignOutMessage')` → maps to `auth.confirmSignOutMessage`
- `t('signOut')` → maps to `auth.signOut`

**Important:** Ensure backward compatibility by keeping these existing keys at their current locations.

### 8.2 ICU Format for Dynamic Values
Use ICU message format for strings with variables:
```json
"rateLimitError": "Too many authentication attempts. Please try again in {minutes} minutes."
"copyright": "© {year} FAQBNB. All rights reserved."
```

### 8.3 JSON Validation
After modifications, ensure:
- Valid JSON syntax (no trailing commas, proper escaping)
- Consistent key structure across all language files
- No duplicate keys

---

## 9. Estimated Effort

| Task | Effort |
|------|--------|
| Extract strings from components | 1 hour |
| Create English namespace structure | 30 minutes |
| Generate 5 non-English translations | 1 hour |
| Validation and testing | 30 minutes |
| **Total** | **3 hours** |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing strings discovered later | Medium | Low | Can add to namespace incrementally |
| Translation quality issues | Low | Medium | AI translations reviewed for critical auth text |
| Key name conflicts with existing usage | Low | High | Preserve existing keys at same paths |
| JSON syntax errors | Low | Medium | Validate JSON after each file modification |

---

## 11. Testing Strategy

### 11.1 Structural Validation
- Verify all 6 language files parse as valid JSON
- Confirm identical key structure across all files
- Check no keys are missing in any language file

### 11.2 Integration Verification
- Build project successfully with `npm run build`
- LogoutButton continues to work (uses existing keys)
- No TypeScript errors related to translations

### 11.3 Future Task Enablement
- Subsequent tasks (2A.2-2A.10) can reference all new keys
- Keys match actual component string requirements

---

## 12. References

- **Request Source:** `/docs/gen_requests_epic2.md` - REQ-355
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **PRD Reference:** PRD_L10N_Epic2_Static_UI_Translation.md
- **Epic 1 Foundation:** Plan-110-L10N-Epic1-Foundation.md
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
